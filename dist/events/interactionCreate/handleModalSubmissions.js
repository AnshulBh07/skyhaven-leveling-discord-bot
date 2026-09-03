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
const userSchema_1 = __importDefault(require("../../models/userSchema"));
const helperArrays_1 = require("../../data/helperArrays");
const configCache_1 = require("../../utils/configCache");
const guildQuestsSchema_1 = __importDefault(require("../../models/guildQuestsSchema"));
const mazeSchema_1 = __importDefault(require("../../models/mazeSchema"));
const permissionsCheck_1 = require("../../utils/permissionsCheck");
const communitySupportSchema_1 = __importDefault(require("../../models/communitySupportSchema"));
const commonUtils_1 = require("../../utils/commonUtils");
const execute = (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!interaction.isModalSubmit())
            return;
        const channel = interaction.channel;
        const guild = interaction.guild;
        if (!channel || !channel.isTextBased() || !guild)
            return;
        yield interaction.deferReply({ flags: "Ephemeral" });
        // handle config checks here after user clicks submit button
        const guildConfig = yield (0, configCache_1.getCachedGuildConfig)(guild.id);
        if (!guildConfig) {
            yield interaction.editReply("Guild config not found.");
            return;
        }
        const { gquestMazeConfig } = guildConfig;
        const { gquestChannelID, mazeChannelID } = gquestMazeConfig;
        const { supportChannelID } = guildConfig.communitySupportConfig;
        // return if not from gquest or maze channel
        if (!(channel.id === gquestChannelID ||
            channel.id === mazeChannelID ||
            channel.id === supportChannelID))
            return;
        // handle gquest rejection modal
        if (interaction.customId.startsWith("gq_rejection_modal") ||
            interaction.customId.startsWith("mz_rejection_modal")) {
            const messageID = interaction.customId.split("_").at(-1);
            const reason = interaction.fields.getTextInputValue("reason");
            const type = interaction.customId.split("_")[0];
            const isAuthorized = yield (0, permissionsCheck_1.isManager)(client, interaction.user.id, guildConfig.serverID, type);
            if (!isAuthorized) {
                yield interaction.editReply({
                    content: "❌ You do not have the permission to perform this action.",
                });
                return;
            }
            if (!messageID) {
                yield interaction.editReply({ content: "Something went wrong." });
                return;
            }
            //   fetch and update related gquest or maze
            const gquestMaze = type === "gq"
                ? yield guildQuestsSchema_1.default.findOneAndUpdate({ messageID: messageID }, {
                    $set: {
                        status: "rejected",
                        rejectedAt: Date.now(),
                        rejectionReason: reason,
                        reviewedBy: interaction.user.id,
                    },
                }, { new: true })
                : yield mazeSchema_1.default.findOneAndUpdate({ messageID: messageID }, {
                    $set: {
                        status: "rejected",
                        rejectedAt: Date.now(),
                        rejectionReason: reason,
                        reviewedBy: interaction.user.id,
                    },
                }, { new: true });
            if (!gquestMaze) {
                yield interaction.editReply({
                    content: "Guild Quest/Maze not found in records.",
                });
                return;
            }
            const { userID, channelID, serverID } = gquestMaze;
            const updateOptions = type === "gq"
                ? {
                    $pull: { "gquests.pending": gquestMaze._id },
                    $push: { "gquests.rejected": gquestMaze._id },
                    $set: { "gquests.lastRejectionDate": new Date() },
                }
                : {
                    $pull: { "mazes.pending": gquestMaze._id },
                    $push: { "mazes.rejected": gquestMaze._id },
                    $set: { "mazes.lastRejectionDate": new Date() },
                };
            const updatedUser = yield userSchema_1.default.findOneAndUpdate({ userID: userID }, updateOptions, { new: true });
            if (!updatedUser) {
                yield interaction.editReply({ content: "No user found" });
                return;
            }
            const guild = yield client.guilds.fetch(serverID);
            const channel = yield guild.channels.fetch(channelID, { force: true });
            const user = yield client.users.fetch(userID);
            if (!channel || channel.type !== 0) {
                yield interaction.editReply({ content: "Invalid channel." });
                return;
            }
            const msg = yield channel.messages.fetch(messageID);
            let gquestImage;
            if (type === "gq")
                gquestImage = new discord_js_1.AttachmentBuilder(gquestMaze.imageUrl).setName("submitted_image.png");
            const thumbnail = new discord_js_1.AttachmentBuilder(helperArrays_1.leaderboardThumbnail).setName("thumbnail.png");
            const rejectEmbed = new discord_js_1.EmbedBuilder()
                .setTitle(`❌ ${type} Rejected`)
                .setThumbnail("attachment://thumbnail.png")
                .setColor("Red")
                .addFields({
                name: "\u200b",
                value: `**📤 Submitted by :**<@${userID}>`,
                inline: false,
            }, {
                name: "\u200b",
                value: `**👤 Reviewed by : **<@${interaction.user.id}>`,
                inline: false,
            }, {
                name: "\u200b",
                value: `**Reason : **${reason}`,
                inline: false,
            }, {
                name: "\u200b",
                value: `**🕒 Submitted On : **<t:${Math.floor(gquestMaze.submittedAt / 1000)}:F>`,
                inline: false,
            }, {
                name: "\u200b",
                value: `**🕒 Rejected On : **<t:${Math.floor(Date.now() / 1000)}:F>`,
                inline: false,
            })
                .setFooter({
                text: `${guild.name} Guild ${type.split("")[0].toUpperCase() + type.slice(1)}s`,
            })
                .setTimestamp();
            if (type === "gq")
                rejectEmbed.setImage("attachment://submitted_image.png");
            // maze message
            const imageUrls = gquestMaze.imageUrls;
            if (type === "gq" && gquestImage) {
                yield msg.edit({
                    embeds: [rejectEmbed],
                    components: [],
                    files: [thumbnail, gquestImage],
                });
            }
            else {
                // find the embed message
                const embedMsg = yield channel.messages.fetch(gquestMaze.embedMessageID);
                yield embedMsg.edit({ embeds: [rejectEmbed], files: [thumbnail] });
                yield msg.edit({
                    embeds: [],
                    files: [thumbnail, ...imageUrls],
                    components: [],
                });
            }
            yield interaction.editReply({
                content: "✅ Rejection processed successfully.",
            });
            const sendNotif = type === "gq" ? updatedUser.gquests.dmNotif : updatedUser.mazes.dmNotif;
            if (sendNotif) {
                try {
                    yield user.send({
                        embeds: [rejectEmbed],
                        files: type === "gq"
                            ? [thumbnail, gquestImage]
                            : [thumbnail, ...imageUrls],
                    });
                }
                catch (err) {
                    console.warn("Cannot send DM to user");
                }
            }
        }
        // handle community contribution modal
        if (interaction.customId.startsWith("contribution_modal")) {
            // console.log("inside contribution modal");
            const messageID = interaction.customId.split("_").at(-1);
            const messageInput = interaction.fields.getTextInputValue("message_input");
            const amountInput = interaction.fields.getTextInputValue("amount_input");
            if (!messageID) {
                yield interaction.editReply({ content: "Invalid inputs!" });
                return;
            }
            if (!/^\d+$/.test(amountInput)) {
                yield interaction.editReply({
                    content: "⚠️ Amount must contain digits only.",
                });
                return;
            }
            const amount = Number(amountInput);
            if (amount < 1000000) {
                yield interaction.editReply({
                    content: "⚠️ Amount must be atleast 1m.",
                });
                return;
            }
            // now update db
            const updatedCampaign = yield communitySupportSchema_1.default.findOneAndUpdate({ messageID: messageID }, {
                $push: {
                    contributors: {
                        contributor_id: interaction.user.id,
                        contributor_name: interaction.user.displayName,
                        contribution_amount: amountInput.toString(),
                        message: messageInput !== null && messageInput !== void 0 ? messageInput : "",
                    },
                },
            }, { new: true });
            if (!updatedCampaign) {
                yield interaction.editReply({ content: "Support campaign not found!" });
                return;
            }
            // now fetch the message and update embed
            const ogMessageChannel = yield guild.channels.fetch(updatedCampaign.channelID, { force: true });
            if (!ogMessageChannel ||
                ogMessageChannel.type !== discord_js_1.ChannelType.GuildText) {
                yield interaction.editReply({ content: "Channel not found!" });
                return;
            }
            // now find the attached thread
            const attachedThread = yield ogMessageChannel.threads.fetch(updatedCampaign.threadID);
            if (!attachedThread || attachedThread.type !== discord_js_1.ChannelType.PublicThread) {
                yield interaction.editReply({ content: "Thread not found!" });
                return;
            }
            const ogMessage = yield ogMessageChannel.messages.fetch(updatedCampaign.messageID);
            const recipient = yield client.users.fetch(updatedCampaign.recipientID);
            const sortedSupporters = updatedCampaign.contributors.sort((a, b) => Number(b.contribution_amount) - Number(a.contribution_amount));
            const allSupporters = sortedSupporters
                .map((c) => `💰 **${c.contributor_name ? c.contributor_name.charAt(0).toUpperCase() + c.contributor_name.slice(1) : "unknown"}** : ${Number(c.contribution_amount).toLocaleString()} ${updatedCampaign.contribution_type}\n`)
                .join("\n");
            const totalAmount = updatedCampaign.contributors.reduce((acc, curr) => acc + Number(curr.contribution_amount), 0);
            const guildLogo = (0, commonUtils_1.getThumbnail)();
            const contributionEmbed = new discord_js_1.EmbedBuilder()
                .setColor("#5865F2")
                .setAuthor({
                name: "Community Support",
                iconURL: guild.iconURL() || undefined,
            })
                .setDescription([
                "",
                "",
                `${(_a = updatedCampaign.reason) !== null && _a !== void 0 ? _a : ""}`,
                "",
                "Every contribution, be it big or small genuinely helps",
                "",
                "",
                "### Progress ",
                `\`${totalAmount} ${updatedCampaign.contribution_type} Raised - ${updatedCampaign.contributors.length} Contributors\``,
                "",
                "",
                "### Contributors List : ",
                `${allSupporters}`,
                "",
            ].join("\n"))
                .addFields({
                name: "\u200b",
                value: "📌 Note\n\nContributions are completely optional and community-driven. To contribute, click the **Contribute** button below and enter the amount you'd like to support with. Thank you to everyone helping a fellow member.",
                inline: false,
            }, {
                name: "\u200b",
                value: [
                    "⚠️ Contribution Conditions\n\n• Minimum contribution amount is `1000000 (1 million)` or higher",
                    "• Amounts must be entered in full digits only.  Examples: `1000000`, `2500000`, `50000000`",
                    "• Abbreviations like `1m`, `500k`, or commas are not allowed",
                    "• Contributions are considered final once submitted",
                    "• Any false or troll contributions may result in moderation action",
                ].join("\n"),
                inline: false,
            })
                .setThumbnail(recipient.displayAvatarURL({ size: 256 }))
                .setFooter({
                text: `Started by ${interaction.user.displayName}`,
                iconURL: "attachment://thumbnail.png",
            })
                .setTimestamp();
            yield ogMessage.edit({ embeds: [contributionEmbed], files: [guildLogo] });
            yield attachedThread.send({
                content: `${interaction.user.displayName.charAt(0).toUpperCase() + interaction.user.displayName.slice(1)} contributed ${Number(amountInput).toLocaleString()} ${updatedCampaign.contribution_type}`,
                embeds: messageInput && messageInput.trim().length > 0
                    ? [new discord_js_1.EmbedBuilder().setDescription(messageInput)]
                    : [],
            });
            yield interaction.editReply({
                content: `You contributed ${Number(amountInput).toLocaleString()} to **${recipient.displayName.charAt(0).toUpperCase() + recipient.displayName.slice(1)}**!`,
            });
        }
    }
    catch (err) {
        console.error("Error in modal submission handler : ", err);
    }
});
exports.default = execute;
