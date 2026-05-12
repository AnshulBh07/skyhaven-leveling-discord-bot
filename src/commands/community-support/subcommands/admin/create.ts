import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { ICommunitySupport, ISubcommand } from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";
import CommunitySupport from "../../../../models/communitySupportSchema";
import { attachCommunitySupportCollector } from "../../../../utils/communitySupportUtils";
import { getThumbnail } from "../../../../utils/commonUtils";

const init = async (): Promise<ISubcommand | undefined> => {
	try {
		return {
			isSubCommand: true,
			data: {
				name: "create",
				description: "create a community support campaign embed.",
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: "user",
						description: "target user",
						type: ApplicationCommandOptionType.User,
						required: true,
					},
					{
						name: "reason",
						description: "description",
						type: ApplicationCommandOptionType.String,
						required: true,
					},
					{
						name: "type",
						description: "currency for donation",
						type: ApplicationCommandOptionType.String,
						required: true,
					},
				],
			},

			callback: async (client, interaction) => {
				try {
					const targetUser = interaction.options.getUser("user");
					const reason = interaction.options.getString("reason");
					const type = interaction.options.getString("type");
					const guild = interaction.guild;

					if (
						!guild ||
						!targetUser ||
						!reason ||
						!reason.length ||
						!type ||
						!type.length ||
						targetUser.bot
					) {
						await interaction.editReply({
							content:
								"⚠️ Invalid command. Please check your input and try again.",
						});
						return;
					}

					const guildConfig = await Config.findOne({ serverID: guild.id });

					if (!guildConfig) {
						await interaction.editReply(
							"🔍 This server could not be identified. Check if the bot has access.",
						);
						return;
					}

					const { supportChannelID } = guildConfig.communitySupportConfig;

					if (!supportChannelID) {
						await interaction.editReply({
							content:
								"⚠️ Invalid command. Please check your input and try again.",
						});
						return;
					}

					const channel = await guild.channels.fetch(supportChannelID, {
						force: true,
					});

					if (!channel || !channel.isTextBased()) {
						await interaction.editReply({
							content:
								"⚠️ Invalid command. Please check your input and try again.",
						});
						return;
					}

					const guildLogo = getThumbnail();

					// create an embed for the donation
					const contributionEmbed = new EmbedBuilder()
						.setColor("#5865F2")
						.setTitle("✨ COMMUNITY SUPPORT POOL ✨")
						.setDescription(
							[
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
						.setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
						.setFooter({
							text: `Started by ${interaction.user.displayName}`,
							iconURL: "attachment://thumbnail.png",
						})
						.setTimestamp();

					await interaction.editReply({ content: "..." });

					const reply = await channel.send({
						embeds: [contributionEmbed],
						files: [guildLogo],
					});

					const supportThread = await reply.startThread({
						name: `Support ${targetUser.displayName.charAt(0).toUpperCase() + targetUser.displayName.slice(1)}`,
						autoArchiveDuration: 1440,
					});

					const communityOptions: ICommunitySupport = {
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
					const newCommunitySupport = new CommunitySupport(communityOptions);
					await newCommunitySupport.save();

					await attachCommunitySupportCollector(
						client,
						newCommunitySupport as ICommunitySupport,
					);
				} catch (err) {
					console.error("Error in support pool create callback : ", err);
				}
			},
		};
	} catch (err) {
		console.error("Error in support pool create command : ", err);
		return undefined;
	}
};

export default init;
