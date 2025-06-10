import { ApplicationCommandOptionType, ChannelType } from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "add-admin",
        description:
          "Adds a role that can manage member's guild maze submissions.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "role",
            description: "management role to add",
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
            await interaction.reply({
              content: "Invalid command",
              flags: "Ephemeral",
            });
            return;
          }

          await interaction.deferReply();

          const config = await Config.findOne({ serverID: guild.id });

          if (!config) {
            await interaction.editReply({ content: "Guild config not found." });
            return;
          }

          const { managerRoles } = config.gquestMazeConfig;

          if (managerRoles.includes(role.id)) {
            await interaction.editReply("Role already set as managment.");
            return;
          }

          config.gquestMazeConfig.managerRoles.push(role.id);
          await config.save();

          await interaction.editReply({
            content: `Added <@&${role.id}> as management role for guild quests.`,
          });
        } catch (err) {
          console.error("Error in maze add-admin callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in maze add-admin subcommand : ", err);
    return undefined;
  }
};

export default init;
