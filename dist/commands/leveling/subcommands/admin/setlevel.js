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
const userSchema_1 = __importDefault(require("../../../../models/userSchema"));
const generateLvlNotif_1 = require("../../../../utils/generateLvlNotif");
const getNextLevelXP_1 = require("../../../../utils/getNextLevelXP");
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "setlevel",
                description: "Set a user's level manually",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "user",
                        description: "target user",
                        type: discord_js_1.ApplicationCommandOptionType.User,
                        required: true,
                    },
                    {
                        name: "level",
                        description: "target level for user",
                        type: discord_js_1.ApplicationCommandOptionType.Number,
                        minValue: 1,
                        maxValue: 150,
                        required: true,
                    },
                ],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const targetUser = interaction.options.getUser("user");
                    const guildID = interaction.guildId;
                    const targetLevel = interaction.options.getNumber("level");
                    if (!targetUser || !guildID || targetUser.bot || !targetLevel) {
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
                    const user = yield userSchema_1.default.findOne({
                        userID: targetUser.id,
                        serverID: guildID,
                    });
                    if (!user) {
                        yield interaction.editReply("No user found");
                        return;
                    }
                    const { levelRoles, notificationChannelID } = guildConfig.levelConfig;
                    const lvlRolesArr = levelRoles.map((role) => {
                        return {
                            roleID: role.roleID,
                            minLevel: role.minLevel,
                            maxLevel: role.maxLevel,
                        };
                    });
                    const prevLevel = user.leveling.level;
                    const guild = yield client.guilds.fetch(guildID);
                    const notifChannel = yield guild.channels.fetch(notificationChannelID, { force: true });
                    if (!notifChannel) {
                        yield interaction.editReply({
                            content: "Notification channel not found.",
                        });
                        return;
                    }
                    // calculate base xp for this level and set the total xp to it
                    let sum = 0;
                    for (let i = 1; i < targetLevel; i++)
                        sum += (0, getNextLevelXP_1.getNextLvlXP)(i);
                    user.leveling.totalXp = sum + 1;
                    // set text and voice xp as old ratio
                    const oldTotal = user.leveling.textXp + user.leveling.voiceXp;
                    if (oldTotal > 0) {
                        const textRatio = user.leveling.textXp / oldTotal;
                        const voiceRatio = user.leveling.voiceXp / oldTotal;
                        user.leveling.textXp = Math.floor(user.leveling.totalXp * textRatio);
                        user.leveling.voiceXp = Math.floor(user.leveling.totalXp * voiceRatio);
                        // Optional fix to ensure total matches exactly after flooring
                        const discrepancy = user.leveling.totalXp -
                            (user.leveling.textXp + user.leveling.voiceXp);
                        user.leveling.textXp += discrepancy;
                    }
                    else {
                        user.leveling.textXp = Math.floor(user.leveling.totalXp / 2);
                        user.leveling.voiceXp =
                            user.leveling.totalXp - user.leveling.textXp;
                    }
                    if (prevLevel !== targetLevel)
                        yield (0, generateLvlNotif_1.generateLvlNotif)(client, user, targetUser, prevLevel, targetLevel, lvlRolesArr, notifChannel, guildID);
                    yield user.save();
                    yield interaction.editReply(prevLevel !== targetLevel
                        ? `Set level ${targetLevel} for user <@${targetUser.id}>`
                        : `No level change has occured`);
                }
                catch (err) {
                    console.error("Error in lvl setlevel subcommand callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in lvl setlevel subcommand callback : ", err);
        return undefined;
    }
});
exports.default = init;
