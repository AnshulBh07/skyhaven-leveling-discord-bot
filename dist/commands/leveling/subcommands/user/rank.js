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
const generateRankCard_1 = require("../../../../canvas/generateRankCard");
const getNextLevelXP_1 = require("../../../../utils/getNextLevelXP");
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "rank",
                description: "Display user level, XP, and rank.",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "user",
                        description: "target user",
                        type: discord_js_1.ApplicationCommandOptionType.User,
                        required: false,
                    },
                ],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                try {
                    const targetUser = (_a = interaction.options.getUser("user")) !== null && _a !== void 0 ? _a : interaction.user;
                    const guildID = interaction.guildId;
                    const channel = interaction.channel;
                    if (!targetUser ||
                        targetUser.bot ||
                        !guildID ||
                        !channel ||
                        channel.type !== discord_js_1.ChannelType.GuildText) {
                        yield interaction.editReply({
                            content: "⚠️ Invalid command. Please check your input and try again.",
                        });
                        return;
                    }
                    // channel shouldn't be in blacklisted channels
                    const guildConfig = yield configSchema_1.default.findOne({
                        serverID: guildID,
                    }).lean();
                    if (!guildConfig) {
                        yield interaction.editReply("🔍 This server could not be identified. Check if the bot has access.");
                        return;
                    }
                    const { notificationChannelID } = guildConfig.levelConfig;
                    const guild = yield client.guilds.fetch(guildID);
                    const notifChannel = yield guild.channels.fetch(notificationChannelID, { force: true });
                    if (!notifChannel) {
                        yield interaction.editReply({
                            content: "Notification channel not found.",
                        });
                        return;
                    }
                    if (interaction.channel &&
                        notifChannel.isTextBased() &&
                        notifChannel.id !== interaction.channel.id) {
                        interaction.editReply(`⚠️ This command can only be used in <#${notificationChannelID}>.`);
                        return;
                    }
                    const targetDoc = yield userSchema_1.default.findOne({
                        userID: targetUser.id,
                        serverID: guildID,
                    }).lean();
                    if (!targetDoc) {
                        interaction.editReply("No user found");
                        return;
                    }
                    // count users in this server with higher totalXp to find rank (1-based)
                    const higherUsersCount = yield userSchema_1.default.countDocuments({
                        serverID: guildID,
                        "leveling.totalXp": { $gt: targetDoc.leveling.totalXp },
                    });
                    const userRank = higherUsersCount + 1;
                    const rankData = {
                        rank: userRank,
                        level: targetDoc.leveling.level,
                        currentXp: targetDoc.leveling.xp,
                        requiredXp: (0, getNextLevelXP_1.getNextLvlXP)(targetDoc.leveling.level),
                    };
                    const rankCard = yield (0, generateRankCard_1.generateRankCard)(targetUser, guild, rankData);
                    if (!rankCard) {
                        console.log("⚠️ rank card generation failed...");
                        interaction.editReply("cannot generate rank card.");
                        return;
                    }
                    const image = new discord_js_1.AttachmentBuilder(rankCard, {
                        name: "rank-card.png",
                    });
                    yield interaction.editReply({ content: "Generating rank card ..." });
                    if (notifChannel && notifChannel.isTextBased()) {
                        yield notifChannel.send({ files: [image] });
                    }
                }
                catch (err) {
                    console.error("Error in lvl rank subcommand callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in lvl rank subcommand callback : ", err);
        return undefined;
    }
});
exports.default = init;
