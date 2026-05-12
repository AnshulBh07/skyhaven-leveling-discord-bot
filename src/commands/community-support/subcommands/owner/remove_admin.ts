import { ApplicationCommandOptionType } from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";

const init = async (): Promise<ISubcommand | undefined> => {
	try {
		return {
			isSubCommand: true,
			data: {
				name: "remove-admin",
				description:
					"Removes a role that can manage community support campaigns.",
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: "role",
						description: "management role to remove",
						type: ApplicationCommandOptionType.Role,
						required: true,
					},
				],
			},

			callback: async (client, interaction) => {
				try {
					const role = interaction.options.getRole("role");
					const guild = interaction.guild;

					if (!role || !guild) {
						await interaction.editReply({
							content:
								"⚠️ Invalid command. Please check your input and try again.",
						});
						return;
					}

					const config = await Config.findOne({ serverID: guild.id });

					if (!config) {
						await interaction.editReply(
							"🔍 This server could not be identified. Check if the bot has access.",
						);
						return;
					}

					const { managerRoles } = config.communitySupportConfig;

					if (!managerRoles.includes(role.id)) {
						await interaction.editReply(
							"⚠️ This role is not set as a management role.",
						);
						return;
					}

					config.communitySupportConfig.managerRoles =
						config.communitySupportConfig.managerRoles.filter(
							(managerRole) => managerRole !== role.id,
						);
					await config.save();

					await interaction.editReply({
						content: `✅ Removed <@&${role.id}> as a management role for communtiy support commands.`,
					});
				} catch (err) {
					console.error(
						"Error in community support remove-admin callback : ",
						err,
					);
				}
			},
		};
	} catch (err) {
		console.error("Error in community support remove-admin subcommand : ", err);
		return undefined;
	}
};

export default init;
