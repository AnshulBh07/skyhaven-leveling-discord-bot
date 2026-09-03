"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const configSchema_1 = __importDefault(require("../../../../models/configSchema"));
const getLevelFromXp_1 = require("../../../../utils/getLevelFromXp");
const userSchema_1 = __importDefault(require("../../../../models/userSchema"));
const generateLvlNotif_1 = require("../../../../utils/generateLvlNotif");
const getDateString_1 = require("../../../../utils/getDateString");
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "addxp",
                description: "Add specified amount of XP to a user",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "user",
                        description: "user to target",
                        type: discord_js_1.ApplicationCommandOptionType.User,
                        required: true,
                    },
                    {
                        name: "amount",
                        description: "amount of xp",
                        type: discord_js_1.ApplicationCommandOptionType.Number,
                        minValue: 1,
                        maxValue: 5000,
                        required: true,
                    },
                ],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const targetUser = interaction.options.getUser("user");
                    const amount = interaction.options.getNumber("amount");
                    const guildId = interaction.guildId;
                    if (!targetUser || !amount || !guildId || targetUser.bot) {
                        yield interaction.editReply({
                            content: "⚠️ Invalid command. Please check your input and try again.",
                        });
                        return;
                    }
                    const user = yield userSchema_1.default.findOne({
                        userID: targetUser.id,
                        serverID: guildId,
                    });
                    const guildConfig = yield configSchema_1.default.findOne({ serverID: guildId });
                    if (!user) {
                        yield interaction.editReply("❌ No user found.");
                        return;
                    }
                    if (!guildConfig) {
                        yield interaction.editReply("🏰 No matching guild found.");
                        return;
                    }
                    const { levelRoles, notificationChannelID } = guildConfig.levelConfig;
                    user.leveling.xp += amount;
                    user.leveling.textXp += amount;
                    const finalLevel = (0, getLevelFromXp_1.getLvlFromXP)(user.leveling.totalXp + amount);
                    const prevLevel = user.leveling.level;
                    const dateStr = (0, getDateString_1.getDateString)(new Date());
                    user.leveling.xpPerDay.set(dateStr, (user.leveling.xpPerDay.get(dateStr) || 0) + amount);
                    const lvlRolesArray = levelRoles.map((role) => {
                        var _a, _b;
                        return {
                            roleID: role.roleID,
                            minLevel: (_a = role.minLevel) !== null && _a !== void 0 ? _a : 1,
                            maxLevel: (_b = role.maxLevel) !== null && _b !== void 0 ? _b : Infinity,
                        };
                    });
                    const guild = yield client.guilds.fetch(guildId);
                    const notifChannel = yield guild.channels.fetch(notificationChannelID, { force: true });
                    if (!notifChannel) {
                        yield interaction.editReply({
                            content: "Notification channel not found.",
                        });
                        return;
                    }
                    if (prevLevel !== finalLevel)
                        yield (0, generateLvlNotif_1.generateLvlNotif)(client, user, targetUser, prevLevel, finalLevel, lvlRolesArray, notifChannel, guildId);
                    else
                        user.leveling.xp += amount;
                    user.leveling.totalXp += amount;
                    yield user.save();
                    yield interaction.editReply(`✨ Added ${amount} XP to <@${targetUser.id}>!`);
                }
                catch (err) {
                    console.error("Error in lvl addxp subcommand callback : ", err);
                    return;
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in lvl addxp subcommand  : ", err);
        return undefined;
    }
});
exports.default = init;
