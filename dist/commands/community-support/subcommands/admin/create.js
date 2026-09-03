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
const communitySupportSchema_1 = __importDefault(require("../../../../models/communitySupportSchema"));
const communitySupportUtils_1 = require("../../../../utils/communitySupportUtils");
const commonUtils_1 = require("../../../../utils/commonUtils");
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "create",
                description: "create a community support campaign embed.",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "user",
                        description: "target user",
                        type: discord_js_1.ApplicationCommandOptionType.User,
                        required: true,
                    },
                    {
                        name: "reason",
                        description: "description",
                        type: discord_js_1.ApplicationCommandOptionType.String,
                        required: true,
                    },
                    {
                        name: "type",
                        description: "currency for donation",
                        type: discord_js_1.ApplicationCommandOptionType.String,
                        required: true,
                    },
                ],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const targetUser = interaction.options.getUser("user");
                    const reason = interaction.options.getString("reason");
                    const type = interaction.options.getString("type");
                    const guild = interaction.guild;
                    if (!guild ||
                        !targetUser ||
                        !reason ||
                        !reason.length ||
                        !type ||
                        !type.length ||
                        targetUser.bot) {
                        yield interaction.editReply({
                            content: "⚠️ Invalid command. Please check your input and try again.",
                        });
                        return;
                    }
                    const guildConfig = yield configSchema_1.default.findOne({ serverID: guild.id });
                    if (!guildConfig) {
                        yield interaction.editReply("🔍 This server could not be identified. Check if the bot has access.");
                        return;
                    }
                    const { supportChannelID } = guildConfig.communitySupportConfig;
                    if (!supportChannelID) {
                        yield interaction.editReply({
                            content: "⚠️ Invalid command. Please check your input and try again.",
                        });
                        return;
                    }
                    const channel = yield guild.channels.fetch(supportChannelID, {
                        force: true,
                    });
                    if (!channel || !channel.isTextBased()) {
                        yield interaction.editReply({
                            content: "⚠️ Invalid command. Please check your input and try again.",
                        });
                        return;
                    }
                    const guildLogo = (0, commonUtils_1.getThumbnail)();
                    // create an embed for the donation
                    const contributionEmbed = new discord_js_1.EmbedBuilder()
                        .setColor("#5865F2")
                        .setTitle("✨ COMMUNITY SUPPORT POOL ✨")
                        .setDescription([
                        "",
                        "",
                        `${reason}`,
                        "",
                        "Every contribution, be it big or small genuinely helps",
                        "",
                        "",
                        "### Progress ",
                        `\`0 ${type} Raised - 0 Contributors\``,
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
                        .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
                        .setFooter({
                        text: `Started by ${interaction.user.displayName}`,
                        iconURL: "attachment://thumbnail.png",
                    })
                        .setTimestamp();
                    yield interaction.editReply({ content: "..." });
                    const reply = yield channel.send({
                        embeds: [contributionEmbed],
                        files: [guildLogo],
                    });
                    const supportThread = yield reply.startThread({
                        name: `Support ${targetUser.displayName.charAt(0).toUpperCase() + targetUser.displayName.slice(1)}`,
                        autoArchiveDuration: 1440,
                    });
                    const communityOptions = {
                        serverID: guild.id,
                        hostID: interaction.user.id,
                        recipientID: targetUser.id,
                        messageID: reply.id,
                        channelID: supportChannelID,
                        reason: reason,
                        threadID: supportThread.id,
                        contribution_type: type,
                        contributors: [],
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        isEnded: false,
                    };
                    // insert whatever we got in db
                    const newCommunitySupport = new communitySupportSchema_1.default(communityOptions);
                    yield newCommunitySupport.save();
                    yield (0, communitySupportUtils_1.attachCommunitySupportCollector)(client, newCommunitySupport);
                }
                catch (err) {
                    console.error("Error in support pool create callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in support pool create command : ", err);
        return undefined;
    }
});
exports.default = init;
