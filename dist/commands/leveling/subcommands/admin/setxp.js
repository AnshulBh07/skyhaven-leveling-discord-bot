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
const userSchema_1 = __importDefault(require("../../../../models/userSchema"));
const getLevelFromXp_1 = require("../../../../utils/getLevelFromXp");
const configSchema_1 = __importDefault(require("../../../../models/configSchema"));
const generateLvlNotif_1 = require("../../../../utils/generateLvlNotif");
const getNextLevelXP_1 = require("../../../../utils/getNextLevelXP");
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "setxp",
                description: "Set a user's text XP to a specific amount",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "user",
                        description: "target user to set",
                        type: discord_js_1.ApplicationCommandOptionType.User,
                        required: true,
                    },
                    {
                        name: "amount",
                        description: "amount to set",
                        type: discord_js_1.ApplicationCommandOptionType.Number,
                        required: true,
                    },
                ],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const targetUser = interaction.options.getUser("user");
                    const amount = interaction.options.getNumber("amount");
                    const guildID = interaction.guildId;
                    if (!targetUser || !amount || targetUser.bot || !guildID) {
                        yield interaction.editReply({
                            content: "⚠️ Invalid command. Please check your input and try again.",
                        });
                        return;
                    }
                    // channel shouldn't be in blacklisted channels
                    const guildConfig = yield configSchema_1.default.findOne({ serverID: guildID });
                    if (!guildConfig) {
                        yield interaction.editReply("🔍 This server could not be identified. Check if the bot has access.");
                        return;
                    }
                    const { levelRoles, notificationChannelID } = guildConfig.levelConfig;
                    const lvlRolesArray = levelRoles.map((role) => {
                        var _a, _b;
                        return {
                            roleID: role.roleID,
                            minLevel: (_a = role.minLevel) !== null && _a !== void 0 ? _a : 1,
                            maxLevel: (_b = role.maxLevel) !== null && _b !== void 0 ? _b : Infinity,
                        };
                    });
                    const user = yield userSchema_1.default.findOne({
                        userID: targetUser.id,
                        serverID: guildID,
                    });
                    if (!user) {
                        yield interaction.editReply("No user found.");
                        return;
                    }
                    const levelBefore = (0, getLevelFromXp_1.getLvlFromXP)(user.leveling.totalXp);
                    const levelAfter = (0, getLevelFromXp_1.getLvlFromXP)(amount);
                    const guild = yield client.guilds.fetch(guildID);
                    const notifChannel = yield guild.channels.fetch(notificationChannelID, { force: true });
                    if (!notifChannel) {
                        yield interaction.editReply({
                            content: "Notification channel not found.",
                        });
                        return;
                    }
                    if (levelAfter !== levelBefore)
                        yield (0, generateLvlNotif_1.generateLvlNotif)(client, user, targetUser, levelBefore, levelAfter, lvlRolesArray, notifChannel, guildID);
                    // calculate leftover amount of xp for user
                    let userLevel = user.leveling.level;
                    let sum = 0;
                    while (--userLevel) {
                        const xp = (0, getNextLevelXP_1.getNextLvlXP)(userLevel);
                        sum += xp;
                    }
                    user.leveling.xp = amount - sum;
                    user.leveling.totalXp = amount;
                    // maintain text and voice xp ratio
                    const oldTotal = user.leveling.textXp + user.leveling.voiceXp;
                    if (oldTotal > 0) {
                        const textRatio = user.leveling.textXp / oldTotal;
                        const voiceRatio = user.leveling.voiceXp / oldTotal;
                        user.leveling.textXp = Math.floor(amount * textRatio);
                        user.leveling.voiceXp = Math.floor(amount * voiceRatio);
                        const discrepancy = amount - (user.leveling.textXp + user.leveling.voiceXp);
                        user.leveling.textXp += discrepancy;
                    }
                    else {
                        user.leveling.textXp = Math.floor(amount / 2);
                        user.leveling.voiceXp = amount - user.leveling.textXp;
                    }
                    yield user.save();
                    yield interaction.editReply(`XP set to ${amount} for <@${user.userID}>`);
                }
                catch (err) {
                    console.error("Error in lvl setxp subcommand callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in lvl setxp subcommand : ", err);
        return undefined;
    }
});
exports.default = init;
