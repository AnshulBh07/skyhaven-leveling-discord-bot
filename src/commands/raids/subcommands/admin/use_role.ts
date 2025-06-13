import { ApplicationCommandOptionType, ChannelType } from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "use-role",
        description:
          "Sets role that enables guild members to participate in raids.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "role",
            description: "role to set",
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

          const updatedConfig = await Config.findOneAndUpdate(
            {
              serverID: guild.id,
            },
            { $set: { "raidConfig.mazeRole": role.id } }
          );

          if (!updatedConfig) {
            await interaction.editReply({ content: "Guild config not found." });
            return;
          }

          await interaction.editReply({
            content: `Guild raid user role set to <@&${role.id}>`,
          });
        } catch (err) {
          console.error("Error in raid role callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in raid role subcommand : ", err);
    return undefined;
  }
};

export default init;
