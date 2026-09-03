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
const getLevelFromXp_1 = require("../../../../utils/getLevelFromXp");
const configSchema_1 = __importDefault(require("../../../../models/configSchema"));
const userSchema_1 = __importDefault(require("../../../../models/userSchema"));
const generateLvlNotif_1 = require("../../../../utils/generateLvlNotif");
const getDateString_1 = require("../../../../utils/getDateString");
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "removexp",
                description: "Remove specified amount of XP from a user",
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
                    const guildID = interaction.guildId;
                    if (!targetUser || !amount || !guildID || targetUser.bot) {
                        yield interaction.editReply({
                            content: "⚠️ Invalid command. Please check your input and try again.",
                        });
                        return;
                    }
                    const guildConfig = yield configSchema_1.default.findOne({ serverID: guildID });
                    if (!guildConfig) {
                        yield interaction.editReply("🔍 This server could not be identified. Check if the bot has access.");
                        return;
                    }
                    const { levelRoles, notificationChannelID } = guildConfig.levelConfig;
                    const user = yield userSchema_1.default.findOne({
                        userID: targetUser.id,
                        serverID: guildID,
                    });
                    if (!user) {
                        yield interaction.editReply("❌ No user found.");
                        return;
                    }
                    const newCurrXp = user.leveling.xp - amount > 0 ? user.leveling.xp - amount : 0;
                    const newTotalXp = user.leveling.totalXp - amount > 0
                        ? user.leveling.totalXp - amount
                        : 0;
                    const newTextXp = user.leveling.textXp - amount > 0
                        ? user.leveling.textXp - amount
                        : 0;
                    user.leveling.xp = newCurrXp;
                    user.leveling.totalXp = newTotalXp;
                    user.leveling.textXp = newTextXp;
                    const dateStr = (0, getDateString_1.getDateString)(new Date());
                    const currPerDay = user.leveling.xpPerDay.get(dateStr) || 0;
                    user.leveling.xpPerDay.set(dateStr, currPerDay - amount > 0 ? currPerDay - amount : 0);
                    const finalLevel = (0, getLevelFromXp_1.getLvlFromXP)(newTotalXp);
                    const lvlRolesArray = levelRoles.map((role) => {
                        var _a, _b;
                        return {
                            roleID: role.roleID,
                            minLevel: (_a = role.minLevel) !== null && _a !== void 0 ? _a : 1,
                            maxLevel: (_b = role.maxLevel) !== null && _b !== void 0 ? _b : Infinity,
                        };
                    });
                    const guild = yield client.guilds.fetch(guildID);
                    const notifChannel = yield guild.channels.fetch(notificationChannelID, { force: true });
                    if (!notifChannel) {
                        yield interaction.editReply({
                            content: "Notification channel not found.",
                        });
                        return;
                    }
                    // check if user is demoted
                    const prevLevel = user.leveling.level;
                    if (prevLevel !== finalLevel)
                        yield (0, generateLvlNotif_1.generateLvlNotif)(client, user, targetUser, prevLevel, finalLevel, lvlRolesArray, notifChannel, guildID);
                    yield user.save();
                    yield interaction.editReply(`Removed ${amount} XP from <@${targetUser.id}>`);
                }
                catch (err) {
                    console.error("Error in lvl removexp subcommand callback : ", err);
                    return;
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in lvl removexp subcommand : ", err);
        return undefined;
    }
});
exports.default = init;
