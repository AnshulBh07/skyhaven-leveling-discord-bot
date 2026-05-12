import path from "path";
import { ICommandObj } from "../../utils/interfaces";
import { fetchAllSubcommands } from "../../utils/fetchSubCommands";
import Config from "../../models/configSchema";
import { isManager, isUser } from "../../utils/permissionsCheck";

const init = async (): Promise<ICommandObj | undefined> => {
	try {
		const result = await fetchAllSubcommands(
			path.join(__dirname, "", "subcommands"),
			false,
		);

		if (!result) return undefined;

		const [adminCommands, userCommands, ownerCommands, subcommandsMap] = result;

		return {
			name: "community-support",
			description: "All commands related to community support",
			options: Array.from(subcommandsMap.entries()).map(
				([_, subcommand]) => subcommand.data,
			),
			permissionsRequired: [],

			callback: async (client, interaction, mood) => {
				try {
					// get input from user interaction
					const subcommandName = interaction.options.getSubcommand(false);
					const guild = interaction.guild;
					const channel = interaction.channel;

					if (!guild || !channel) {
						await interaction.editReply({
							content:
								"⚠️ Invalid command. Please check your input and try again.",
						});
						return;
					}

					if (!subcommandName) {
						await interaction.editReply({
							content:
								"⚠️ No subcommands detected. Make sure you're using the correct syntax.",
						});
						return;
					}

					const subCmdKey = subcommandName;
					const subCmd = subcommandsMap.get(subCmdKey);

					if (!subCmd) {
						await interaction.editReply({
							content:
								"⚠️ No subcommands detected. Make sure you're using the correct syntax.",
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

					const { botAdminIDs } = guildConfig.moderationConfig;
					const { supportChannelID } = guildConfig.communitySupportConfig;
					const isAdmin = botAdminIDs.includes(interaction.user.id);

					// if it is an owner command and user is not owner
					if (ownerCommands.includes(subcommandName) && !isAdmin) {
						await interaction.editReply({
							content:
								"⚠️ You lack the required permissions to use this command.",
						});
						return;
					}

					// check permissions
					// command name is gonna be unique for given root command
					if (adminCommands.includes(subcommandName) && !isAdmin) {
						if (
							!(await isManager(client, interaction.user.id, guild.id, "cs"))
						) {
							await interaction.editReply({
								content:
									"⚠️ You lack the required permissions to use this command.",
							});
							return;
						}
					}

					if (userCommands.includes(subcommandName) && !isAdmin) {
						if (!(await isUser(client, interaction.user.id, guild.id, "cs"))) {
							await interaction.editReply({
								content:
									"⚠️ You lack the required permissions to use this command.",
							});
							return;
						}
					}

					// admins and users will be forced to use designated channel
					if (!isAdmin && channel.id !== supportChannelID) {
						await interaction.editReply({
							content: `⚠️ You cannot use this command in this channel. Please use it in <#${supportChannelID}>.`,
						});
						return;
					}

					// call the function
					await subCmd.callback(client, interaction);
				} catch (err) {
					console.error(
						"Error in community-support root command callabck : ",
						err,
					);
				}
			},
		};
	} catch (err) {
		console.error("Error in community support root command! : ", err);
		return undefined;
	}
};

export default init;
