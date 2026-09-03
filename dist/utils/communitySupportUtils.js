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
exports.attachCommunitySupportCollector = void 0;
const discord_js_1 = require("discord.js");
const configSchema_1 = __importDefault(require("../models/configSchema"));
const communitySupportSchema_1 = __importDefault(require("../models/communitySupportSchema"));
const attachCommunitySupportCollector = (client, communitySupport) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const guild = yield client.guilds.fetch(communitySupport.serverID);
        const channel = yield guild.channels.fetch(communitySupport.channelID);
        if (!channel || channel.type !== discord_js_1.ChannelType.GuildText)
            return;
        const announceMessage = yield channel.messages.fetch({
            message: communitySupport.messageID,
            force: true,
        });
        const guildConfig = yield configSchema_1.default.findOne({ serverID: guild.id });
        if (!guildConfig)
            return;
        // create buttons for the embed
        const buttonRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setLabel("Contribute")
            .setCustomId(`contribute_btn_${communitySupport.messageID}`)
            .setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder()
            .setLabel("Close")
            .setCustomId(`end_btn_${communitySupport.messageID}`)
            .setStyle(discord_js_1.ButtonStyle.Danger));
        yield announceMessage.edit({ components: [buttonRow] });
        // attach a collector on buttons
        const collector = announceMessage.createMessageComponentCollector({
            time: 0,
            filter: (i) => [
                `contribute_btn_${communitySupport.messageID}`,
                `end_btn_${communitySupport.messageID}`,
            ].includes(i.customId) && !i.user.bot,
        });
        collector.on("collect", (compInt) => __awaiter(void 0, void 0, void 0, function* () {
            if (compInt.isButton()) {
                const customId = compInt.customId;
                const isContribute = customId === `contribute_btn_${communitySupport.messageID}`;
                const isClose = customId === `end_btn_${communitySupport.messageID}`;
                // get fresh data from db
                const freshData = yield communitySupportSchema_1.default.findOne({
                    messageID: communitySupport.messageID,
                });
                if (!freshData) {
                    yield compInt.reply({ content: "Internal error occured!" });
                    return;
                }
                if (isContribute) {
                    // check if user has already contributed
                    const contributors = freshData.contributors;
                    if (contributors.some((c) => c.contributor_id === compInt.user.id)) {
                        yield compInt.reply({
                            content: "You have already contributed. You cannot do it again!",
                            flags: "Ephemeral",
                        });
                        return;
                    }
                    const contributeModal = new discord_js_1.ModalBuilder()
                        .setCustomId(`contribution_modal_${announceMessage.id}`)
                        .setTitle("Contribute");
                    // amount input
                    const amountInput = new discord_js_1.TextInputBuilder()
                        .setCustomId("amount_input")
                        .setLabel("Contribution Amount")
                        .setPlaceholder("1000000, 5000000, 100000000")
                        .setStyle(discord_js_1.TextInputStyle.Short)
                        .setRequired(true)
                        .setMaxLength(20);
                    // optional message
                    const messageInput = new discord_js_1.TextInputBuilder()
                        .setCustomId("message_input")
                        .setLabel("Message (Optional)")
                        .setPlaceholder("Hope things get better soon.")
                        .setStyle(discord_js_1.TextInputStyle.Paragraph)
                        .setRequired(false)
                        .setMaxLength(200);
                    const amountRow = new discord_js_1.ActionRowBuilder().addComponents(amountInput);
                    const messageRow = new discord_js_1.ActionRowBuilder().addComponents(messageInput);
                    contributeModal.addComponents(amountRow, messageRow);
                    yield compInt.showModal(contributeModal);
                }
                if (isClose) {
                    yield compInt.deferReply({ flags: "Ephemeral" });
                    if (compInt.user.id !== communitySupport.hostID) {
                        yield compInt.editReply({
                            content: "⚠️ Only the creator of this support post can close it.",
                        });
                        return;
                    }
                    yield announceMessage.edit({
                        components: [],
                    });
                    // close it in db too
                    const updatedCampaign = yield communitySupportSchema_1.default.findOneAndUpdate({ messageID: communitySupport.messageID }, { $set: { isEnded: true } }, { new: true });
                    yield compInt.editReply({
                        content: "🔒 Support campaign closed.",
                    });
                    collector.stop("campaign_closed");
                    const totalAmount = updatedCampaign
                        ? updatedCampaign.contributors.reduce((acc, curr) => acc + Number(curr.contribution_amount), 0)
                        : 0;
                    yield announceMessage.reply({
                        content: [
                            "### This community support campaign has now been closed.",
                            "",
                            `💰 Total Support Raised: \`${totalAmount.toLocaleString()} ${updatedCampaign === null || updatedCampaign === void 0 ? void 0 : updatedCampaign.contribution_type}\``,
                            "",
                            "Thank you to everyone who contributed and helped support a fellow member during a difficult situation.",
                            "Your generosity and kindness are greatly appreciated by both the staff team and the recipient.",
                            "",
                            "No further contributions can be made to this campaign.",
                        ].join("\n"),
                    });
                }
            }
        }));
    }
    catch (err) {
        console.error("Error while attaching community support collector to : ", err);
    }
});
exports.attachCommunitySupportCollector = attachCommunitySupportCollector;
