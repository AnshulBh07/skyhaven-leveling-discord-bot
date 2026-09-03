import {
	AttachmentBuilder,
	ChannelType,
	Client,
	EmbedBuilder,
	ModalSubmitInteraction,
} from "discord.js";
import User from "../../models/userSchema";
import { leaderboardThumbnail } from "../../data/helperArrays";
import { getCachedGuildConfig } from "../../utils/configCache";
import GQuest from "../../models/guildQuestsSchema";
import Maze from "../../models/mazeSchema";
import { IGquest, IMaze } from "../../utils/interfaces";
import { isManager } from "../../utils/permissionsCheck";
import CommunitySupport from "../../models/communitySupportSchema";
import { getThumbnail } from "../../utils/commonUtils";

const execute = async (client: Client, interaction: ModalSubmitInteraction) => {
	try {
		if (!interaction.isModalSubmit()) return;

		const channel = interaction.channel;
		const guild = interaction.guild;

		if (!channel || !channel.isTextBased() || !guild) return;

		await interaction.deferReply({ flags: "Ephemeral" });

		// handle config checks here after user clicks submit button

		const guildConfig = await getCachedGuildConfig(guild.id);

		if (!guildConfig) {
			await interaction.editReply("Guild config not found.");
			return;
		}

		const { gquestMazeConfig } = guildConfig;
		const { gquestChannelID, mazeChannelID } = gquestMazeConfig;
		const { supportChannelID } = guildConfig.communitySupportConfig;

		// return if not from gquest or maze channel
		if (
			!(
				channel.id === gquestChannelID ||
				channel.id === mazeChannelID ||
				channel.id === supportChannelID
			)
		)
			return;

		// handle gquest rejection modal
		if (
			interaction.customId.startsWith("gq_rejection_modal") ||
			interaction.customId.startsWith("mz_rejection_modal")
		) {
			const messageID = interaction.customId.split("_").at(-1);
			const reason = interaction.fields.getTextInputValue("reason");
			const type = interaction.customId.split("_")[0];

			const isAuthorized = await isManager(
				client,
				interaction.user.id,
				guildConfig.serverID,
				type,
			);
			if (!isAuthorized) {
				await interaction.editReply({
					content: "❌ You do not have the permission to perform this action.",
				});
				return;
			}

			if (!messageID) {
				await interaction.editReply({ content: "Something went wrong." });
				return;
			}

			//   fetch and update related gquest or maze
			const gquestMaze =
				type === "gq"
					? await GQuest.findOneAndUpdate(
							{ messageID: messageID },
							{
								$set: {
									status: "rejected",
									rejectedAt: Date.now(),
									rejectionReason: reason,
									reviewedBy: interaction.user.id,
								},
							},
							{ new: true },
						)
					: await Maze.findOneAndUpdate(
							{ messageID: messageID },
							{
								$set: {
									status: "rejected",
									rejectedAt: Date.now(),
									rejectionReason: reason,
									reviewedBy: interaction.user.id,
								},
							},
							{ new: true },
						);

			if (!gquestMaze) {
				await interaction.editReply({
					content: "Guild Quest/Maze not found in records.",
				});
				return;
			}

			const { userID, channelID, serverID } = gquestMaze;

			const updateOptions =
				type === "gq"
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

			const updatedUser = await User.findOneAndUpdate(
				{ userID: userID },
				updateOptions,
				{ new: true },
			);

			if (!updatedUser) {
				await interaction.editReply({ content: "No user found" });
				return;
			}

			const guild = await client.guilds.fetch(serverID);
			const channel = await guild.channels.fetch(channelID, { force: true });
			const user = await client.users.fetch(userID);

			if (!channel || channel.type !== 0) {
				await interaction.editReply({ content: "Invalid channel." });
				return;
			}

			const msg = await channel.messages.fetch(messageID);

			let gquestImage;

			if (type === "gq")
				gquestImage = new AttachmentBuilder(
					(gquestMaze as IGquest).imageUrl,
				).setName("submitted_image.png");

			const thumbnail = new AttachmentBuilder(leaderboardThumbnail).setName(
				"thumbnail.png",
			);

			const rejectEmbed = new EmbedBuilder()
				.setTitle(`❌ ${type} Rejected`)
				.setThumbnail("attachment://thumbnail.png")
				.setColor("Red")
				.addFields(
					{
						name: "\u200b",
						value: `**📤 Submitted by :**<@${userID}>`,
						inline: false,
					},
					{
						name: "\u200b",
						value: `**👤 Reviewed by : **<@${interaction.user.id}>`,
						inline: false,
					},
					{
						name: "\u200b",
						value: `**Reason : **${reason}`,
						inline: false,
					},
					{
						name: "\u200b",
						value: `**🕒 Submitted On : **<t:${Math.floor(
							gquestMaze.submittedAt / 1000,
						)}:F>`,
						inline: false,
					},
					{
						name: "\u200b",
						value: `**🕒 Rejected On : **<t:${Math.floor(
							Date.now() / 1000,
						)}:F>`,
						inline: false,
					},
				)
				.setFooter({
					text: `${guild.name} Guild ${
						type.split("")[0].toUpperCase() + type.slice(1)
					}s`,
				})
				.setTimestamp();

			if (type === "gq")
				rejectEmbed.setImage("attachment://submitted_image.png");

			// maze message
			const imageUrls = (gquestMaze as IMaze).imageUrls;

			if (type === "gq" && gquestImage) {
				await msg.edit({
					embeds: [rejectEmbed],
					components: [],
					files: [thumbnail, gquestImage],
				});
			} else {
				// find the embed message
				const embedMsg = await channel.messages.fetch(
					(gquestMaze as IMaze).embedMessageID,
				);

				await embedMsg.edit({ embeds: [rejectEmbed], files: [thumbnail] });
				await msg.edit({
					embeds: [],
					files: [thumbnail, ...imageUrls],
					components: [],
				});
			}

			await interaction.editReply({
				content: "✅ Rejection processed successfully.",
			});

			const sendNotif =
				type === "gq" ? updatedUser.gquests.dmNotif : updatedUser.mazes.dmNotif;

			if (sendNotif) {
				try {
					await user.send({
						embeds: [rejectEmbed],
						files:
							type === "gq"
								? [thumbnail, gquestImage!]
								: [thumbnail, ...imageUrls],
					});
				} catch (err) {
					console.warn("Cannot send DM to user");
				}
			}
		}

		// handle community contribution modal
		if (interaction.customId.startsWith("contribution_modal")) {
			// console.log("inside contribution modal");
			const messageID = interaction.customId.split("_").at(-1);
			const messageInput =
				interaction.fields.getTextInputValue("message_input");
			const amountInput = interaction.fields.getTextInputValue("amount_input");

			if (!messageID) {
				await interaction.editReply({ content: "Invalid inputs!" });
				return;
			}

			if (!/^\d+$/.test(amountInput)) {
				await interaction.editReply({
					content: "⚠️ Amount must contain digits only.",
				});

				return;
			}

			const amount = Number(amountInput);

			if (amount < 1000000) {
				await interaction.editReply({
					content: "⚠️ Amount must be atleast 1m.",
				});

				return;
			}

			// now update db
			const updatedCampaign = await CommunitySupport.findOneAndUpdate(
				{ messageID: messageID },
				{
					$push: {
						contributors: {
							contributor_id: interaction.user.id,
							contributor_name: interaction.user.displayName,
							contribution_amount: amountInput.toString(),
							message: messageInput ?? "",
						},
					},
				},
				{ new: true },
			);

			if (!updatedCampaign) {
				await interaction.editReply({ content: "Support campaign not found!" });
				return;
			}

			// now fetch the message and update embed
			const ogMessageChannel = await guild.channels.fetch(
				updatedCampaign.channelID,
				{ force: true },
			);

			if (
				!ogMessageChannel ||
				ogMessageChannel.type !== ChannelType.GuildText
			) {
				await interaction.editReply({ content: "Channel not found!" });
				return;
			}

			// now find the attached thread
			const attachedThread = await ogMessageChannel.threads.fetch(
				updatedCampaign.threadID,
			);

			if (!attachedThread || attachedThread.type !== ChannelType.PublicThread) {
				await interaction.editReply({ content: "Thread not found!" });
				return;
			}

			const ogMessage = await ogMessageChannel.messages.fetch(
				updatedCampaign.messageID,
			);

			const recipient = await client.users.fetch(updatedCampaign.recipientID);

			const sortedSupporters = updatedCampaign.contributors.sort(
				(a, b) => Number(b.contribution_amount) - Number(a.contribution_amount),
			);

			const allSupporters = sortedSupporters
				.map(
					(c) =>
						`💰 **${c.contributor_name ? c.contributor_name.charAt(0).toUpperCase() + c.contributor_name.slice(1) : "unknown"}** : ${Number(c.contribution_amount).toLocaleString()} ${updatedCampaign.contribution_type}\n`,
				)
				.join("\n");

			const totalAmount = updatedCampaign.contributors.reduce(
				(acc, curr) => acc + Number(curr.contribution_amount),
				0,
			);

			const guildLogo = getThumbnail();

			const contributionEmbed = new EmbedBuilder()
				.setColor("#5865F2")
				.setAuthor({
					name: "Community Support",
					iconURL: guild.iconURL() || undefined,
				})
				.setDescription(
					[
						"",
						"",
						`${updatedCampaign.reason ?? ""}`,
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
					].join("\n"),
				)
				.addFields(
					{
						name: "\u200b",
						value:
							"📌 Note\n\nContributions are completely optional and community-driven. To contribute, click the **Contribute** button below and enter the amount you'd like to support with. Thank you to everyone helping a fellow member.",
						inline: false,
					},
					{
						name: "\u200b",
						value: [
							"⚠️ Contribution Conditions\n\n• Minimum contribution amount is `1000000 (1 million)` or higher",
							"• Amounts must be entered in full digits only.  Examples: `1000000`, `2500000`, `50000000`",
							"• Abbreviations like `1m`, `500k`, or commas are not allowed",
							"• Contributions are considered final once submitted",
							"• Any false or troll contributions may result in moderation action",
						].join("\n"),
						inline: false,
					},
				)
				.setThumbnail(recipient.displayAvatarURL({ size: 256 }))
				.setFooter({
					text: `Started by ${interaction.user.displayName}`,
					iconURL: "attachment://thumbnail.png",
				})
				.setTimestamp();

			await ogMessage.edit({ embeds: [contributionEmbed], files: [guildLogo] });

			await attachedThread.send({
				content: `${interaction.user.displayName.charAt(0).toUpperCase() + interaction.user.displayName.slice(1)} contributed ${Number(amountInput).toLocaleString()} ${updatedCampaign.contribution_type}`,
				embeds:
					messageInput && messageInput.trim().length > 0
						? [new EmbedBuilder().setDescription(messageInput)]
						: [],
			});

			await interaction.editReply({
				content: `You contributed ${Number(amountInput).toLocaleString()} to **${recipient.displayName.charAt(0).toUpperCase() + recipient.displayName.slice(1)}**!`,
			});
		}
	} catch (err) {
		console.error("Error in modal submission handler : ", err);
	}
};

export default execute;
