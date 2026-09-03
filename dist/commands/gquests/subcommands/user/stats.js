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
const helperArrays_1 = require("../../../../data/helperArrays");
const gquestUtils_1 = require("../../../../utils/gquestUtils");
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "stats",
                description: "Gives complete gquest related stats for a user.",
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
                    const guild = interaction.guild;
                    const channel = interaction.channel;
                    const user = yield userSchema_1.default.findOne({ userID: targetUser.id });
                    if (!user ||
                        !guild ||
                        !channel ||
                        channel.type !== discord_js_1.ChannelType.GuildText) {
                        yield interaction.editReply({
                            content: `⚠️ Invalid command. Please check your input and try again.`,
                        });
                        return;
                    }
                    const thumbnail = new discord_js_1.AttachmentBuilder(helperArrays_1.leaderboardThumbnail).setName("thumbnail.png");
                    const gquestStatusEmbed = new discord_js_1.EmbedBuilder()
                        .setTitle(`📊 Guild Quest Status`)
                        .setColor("Blurple")
                        .addFields({ name: "\u200b", value: `**👤 User : **<@${targetUser.id}>` }, {
                        name: "\u200b",
                        value: `**📥 Pending : **${user.gquests.pending.length}`,
                        inline: false,
                    }, {
                        name: "\u200b",
                        value: `**🏆 Rewarded : **${user.gquests.rewarded.length}`,
                        inline: false,
                    }, {
                        name: "",
                        value: `**❌ Rejected : **${user.gquests.rejected.length}`,
                        inline: true,
                    }, {
                        name: "\u200b",
                        value: `**📈 Contribution Score : **${(0, gquestUtils_1.getContributionScore)(user.gquests.rewarded.length, user.gquests.rejected.length)}`,
                        inline: false,
                    }, {
                        name: "\u200b",
                        value: `**⏳ Last Submission : **${user.gquests.lastSubmissionDate
                            ? `<t:${Math.floor(user.gquests.lastSubmissionDate.getTime() / 1000)}:F>`
                            : "None"}`,
                        inline: false,
                    }, {
                        name: "\u200b",
                        value: `**💰 Total Rewards : **${user.gquests.totalRewarded.toLocaleString("en-US")} spina`,
                        inline: false,
                    }, {
                        name: "\u200b",
                        value: `**📬 DM Notifications : **${user.gquests.dmNotif ? "🟢 Enabled" : "🔴 Disabled"}`,
                        inline: false,
                    })
                        .setFooter({
                        text: `${guild.name} Guild Quests`,
                        iconURL: "attachment://thumbnail.png",
                    })
                        .setTimestamp();
                    yield interaction.editReply({
                        embeds: [gquestStatusEmbed],
                        files: [thumbnail],
                    });
                }
                catch (err) {
                    console.error("Error in gquest stats subcommand callabck : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in stats subcommand : ", err);
        return undefined;
    }
});
exports.default = init;
