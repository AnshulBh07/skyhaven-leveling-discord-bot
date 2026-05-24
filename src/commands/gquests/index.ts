// root file for guild quests commands
import path from "path";
import { ICommandObj } from "../../utils/interfaces";
import { isManager, isUser } from "../../utils/permissionsCheck";
import Config from "../../models/configSchema";
import { fetchAllSubcommands } from "../../utils/fetchSubCommands";

const init = async (): Promise<ICommandObj | undefined> => {
	try {
		const result = await fetchAllSubcommands(
			path.join(__dirname, "", "subcommands"),
			false,
		);

		if (!result) return undefined;

		const [adminCommands, userCommands, ownerCommands, subcommandsMap] = result;

		return {
			name: "gq",
			description: "All commands related to guild quests",
			options: Array.from(subcommandsMap.entries()).map(
				([_, subcommand]) => subcommand.data,
			),
			permissionsRequired: [],

			callback: async (client, interaction) => {
				try {
					// for a valid command call the clalback function using map
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
					const { gquestChannelID } = guildConfig.gquestMazeConfig;

					// if it is an owner command and user is not owner
					if (
						ownerCommands.includes(subcommandName) &&
						!botAdminIDs.includes(interaction.user.id)
					) {
						await interaction.editReply({
							content:
								"⚠️ You lack the required permissions to use this command.",
						});
						return;
					}

					// check permissions
					// command name is gonna be unique for given root command
					if (adminCommands.includes(subcommandName)) {
						if (
							!(await isManager(client, interaction.user.id, guild.id, "gq"))
						) {
							await interaction.editReply({
								content:
									"⚠️ You lack the required permissions to use this command.",
							});
							return;
						}
					}

					if (userCommands.includes(subcommandName)) {
						if (!(await isUser(client, interaction.user.id, guild.id, "gq"))) {
							await interaction.editReply({
								content:
									"⚠️ You lack the required permissions to use this command.",
							});
							return;
						}
					}

					// admins and users will be forced to use designated channel
					if (
						!botAdminIDs.includes(interaction.user.id) &&
						channel.id !== gquestChannelID
					) {
						await interaction.editReply({
							content: `⚠️ You cannot use this command in this channel. Please use it in <#${gquestChannelID}>.`,
						});
						return;
					}

					// call the function
					await subCmd.callback(client, interaction);
				} catch (err) {
					console.error("Error in gquest root command callback : ", err);
				}
			},
		};
	} catch (err) {
		console.error("Error in gquest root command : ", err);
		return undefined;
	}
};

export default init;
