import { ApplicationCommandOptionType, ChannelType } from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";

const init = async (): Promise<ISubcommand | undefined> => {
	try {
		return {
			isSubCommand: true,
			data: {
				name: "channel",
				description: "Sets channel for communtiy support.",
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: "channel",
						description: "target channel",
						type: ApplicationCommandOptionType.Channel,
						channel_types: [ChannelType.GuildText],
						required: true,
					},
				],
			},

			callback: async (client, interaction) => {
				try {
					const channel = interaction.options.getChannel("channel");
					const guildID = interaction.guildId;

					if (!channel || channel.type !== 0 || !guildID) {
						await interaction.editReply({
							content: `⚠️ Invalid command. Please check your input and try again.`,
						});
						return;
					}

					const guildConfig = await Config.findOne({ serverID: guildID });

					if (!guildConfig) {
						await interaction.editReply({
							content:
								"🔍 This server could not be identified. Check if the bot has access.",
						});
						return;
					}

					guildConfig.communitySupportConfig.supportChannelID = channel.id;
					await guildConfig.save();

					await interaction.editReply({
						content: `📢 Community support channel updated to: ${channel}`,
					});
				} catch (err) {
					console.error("Error in community-support channel callback", err);
				}
			},
		};
	} catch (err) {
		console.error("Error in community-support channel command", err);
		return undefined;
	}
};

export default init;
