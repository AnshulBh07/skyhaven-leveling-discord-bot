import { ApplicationCommandOptionType } from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Raid from "../../../../models/raidSchema";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "cancel",
        description: "Cancel a scheduled raid",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "raid_id",
            description: "ID of raid to cancel",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },

      callback: async (client, interaction) => {
        try {
          const guild = interaction.guild;
          const raid_id = interaction.options.getString("raid_id");

          if (!guild || !raid_id) {
            await interaction.editReply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
            });
            return;
          }

          const deleted = await Raid.findOneAndDelete({
            announcementMessageID: raid_id,
            serverID: guild.id,
          });

          if (!deleted) {
            await interaction.editReply({ content: "No raid found." });
            return;
          }

          await interaction.editReply({
            content: "Raid has been deleted successfully.",
          });
        } catch (err) {
          console.error("Error in raid cancel subcommand callabck : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in raid cancel subcommand : ", err);
    return undefined;
  }
};

export default init;
