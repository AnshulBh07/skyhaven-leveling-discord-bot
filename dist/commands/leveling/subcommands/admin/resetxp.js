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
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "resetxp",
                description: "Reset a user's text XP, voice XP and level to 1",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "user",
                        description: "target user",
                        type: discord_js_1.ApplicationCommandOptionType.User,
                        required: true,
                    },
                ],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const targetUser = interaction.options.getUser("user");
                    const guildID = interaction.guildId;
                    if (!targetUser || !guildID || targetUser.bot) {
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
                    const lvlRolesArr = levelRoles.map((role) => {
                        return {
                            roleID: role.roleID,
                            minLevel: role.minLevel,
                            maxLevel: role.maxLevel,
                        };
                    });
                    const user = yield userSchema_1.default.findOne({
                        userID: targetUser.id,
                        serverID: guildID,
                    });
                    if (!user) {
                        yield interaction.editReply("No user found");
                        return;
                    }
                    const prevLevel = user.leveling.level;
                    const finalLevel = 1;
                    const guild = yield client.guilds.fetch(guildID);
                    const notifChannel = yield guild.channels.fetch(notificationChannelID, { force: true });
                    if (!notifChannel) {
                        yield interaction.editReply({
                            content: "Notification channel not found.",
                        });
                        return;
                    }
                    if (prevLevel !== finalLevel)
                        yield (0, generateLvlNotif_1.generateLvlNotif)(client, user, targetUser, prevLevel, finalLevel, lvlRolesArr, notifChannel, guildID);
                    user.leveling.xp = 0;
                    user.leveling.totalXp = 0;
                    user.leveling.voiceXp = 0;
                    user.leveling.textXp = 0;
                    user.leveling.xpPerDay = new Map();
                    yield user.save();
                    yield interaction.editReply(`⚠️ <@${targetUser.id}> xp is reduced to dust.`);
                }
                catch (err) {
                    console.error("Error in lvl resetxp subcommand callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in lvl resetxp subcommand : ", err);
        return undefined;
    }
});
exports.default = init;
