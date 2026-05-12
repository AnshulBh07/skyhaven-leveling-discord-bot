import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	Client,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import { ICommunitySupport } from "./interfaces";
import Config from "../models/configSchema";
import CommunitySupport from "../models/communitySupportSchema";

export const attachCommunitySupportCollector = async (
	client: Client,
	communitySupport: ICommunitySupport,
) => {
	try {
		const guild = await client.guilds.fetch(communitySupport.serverID);
		const channel = await guild.channels.fetch(communitySupport.channelID);

		if (!channel || channel.type !== ChannelType.GuildText) return;

		const announceMessage = await channel.messages.fetch({
			message: communitySupport.messageID,
			force: true,
		});

		const guildConfig = await Config.findOne({ serverID: guild.id });

		if (!guildConfig) return;

		// create buttons for the embed
		const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setLabel("Contribute")
				.setCustomId(`contribute_btn_${communitySupport.messageID}`)
				.setStyle(ButtonStyle.Success),
			new ButtonBuilder()
				.setLabel("Close")
				.setCustomId(`end_btn_${communitySupport.messageID}`)
				.setStyle(ButtonStyle.Danger),
		);

		await announceMessage.edit({ components: [buttonRow] });

		// attach a collector on buttons
		const collector = announceMessage.createMessageComponentCollector({
			time: 0,
			filter: (i) =>
				[
					`contribute_btn_${communitySupport.messageID}`,
					`end_btn_${communitySupport.messageID}`,
				].includes(i.customId) && !i.user.bot,
		});

		collector.on("collect", async (compInt) => {
			if (compInt.isButton()) {
				const customId = compInt.customId;
				const isContribute =
					customId === `contribute_btn_${communitySupport.messageID}`;
				const isClose = customId === `end_btn_${communitySupport.messageID}`;

				// get fresh data from db
				const freshData = await CommunitySupport.findOne({
					messageID: communitySupport.messageID,
				});

				if (!freshData) {
					await compInt.reply({ content: "Internal error occured!" });
					return;
				}

				if (isContribute) {
					// check if user has already contributed
					const contributors = freshData.contributors;

					if (contributors.some((c) => c.contributor_id === compInt.user.id)) {
						await compInt.reply({
							content: "You have already contributed. You cannot do it again!",
							flags: "Ephemeral",
						});
						return;
					}

					const contributeModal = new ModalBuilder()
						.setCustomId(`contribution_modal_${announceMessage.id}`)
						.setTitle("Contribute");

					// amount input
					const amountInput = new TextInputBuilder()
						.setCustomId("amount_input")
						.setLabel("Contribution Amount")
						.setPlaceholder("1000000, 5000000, 100000000")
						.setStyle(TextInputStyle.Short)
						.setRequired(true)
						.setMaxLength(20);

					// optional message
					const messageInput = new TextInputBuilder()
						.setCustomId("message_input")
						.setLabel("Message (Optional)")
						.setPlaceholder("Hope things get better soon.")
						.setStyle(TextInputStyle.Paragraph)
						.setRequired(false)
						.setMaxLength(200);

					const amountRow =
						new ActionRowBuilder<TextInputBuilder>().addComponents(amountInput);

					const messageRow =
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							messageInput,
						);

					contributeModal.addComponents(amountRow, messageRow);

					await compInt.showModal(contributeModal);
				}

				if (isClose) {
					await compInt.deferReply({ flags: "Ephemeral" });

					if (compInt.user.id !== communitySupport.hostID) {
						await compInt.editReply({
							content: "⚠️ Only the creator of this support post can close it.",
						});

						return;
					}

					await announceMessage.edit({
						components: [],
					});

					// close it in db too
					const updatedCampaign = await CommunitySupport.findOneAndUpdate(
						{ messageID: communitySupport.messageID },
						{ $set: { isEnded: true } },
						{ new: true },
					);

					await compInt.editReply({
						content: "🔒 Support campaign closed.",
					});

					collector.stop("campaign_closed");

					const totalAmount = updatedCampaign
						? updatedCampaign.contributors.reduce(
								(acc, curr) => acc + Number(curr.contribution_amount),
								0,
							)
						: 0;

					await announceMessage.reply({
						content: [
							"### This community support campaign has now been closed.",
							"",
							`💰 Total Support Raised: \`${totalAmount.toLocaleString()} ${updatedCampaign?.contribution_type}\``,
							"",
							"Thank you to everyone who contributed and helped support a fellow member during a difficult situation.",
							"Your generosity and kindness are greatly appreciated by both the staff team and the recipient.",
							"",
							"No further contributions can be made to this campaign.",
						].join("\n"),
					});
				}
			}
		});
	} catch (err) {
		console.error(
			"Error while attaching community support collector to : ",
			err,
		);
	}
};
