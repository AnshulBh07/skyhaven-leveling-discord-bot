import { ApplicationCommandOptionType } from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import User from "../../../../models/userSchema";
import { getGquestMazeLeaderboard } from "../../../../utils/gquestUtils";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "leaderboard",
        description: "List of top guild quest contributors",
        type: ApplicationCommandOptionType.Subcommand,
        options: [],
      },

      callback: async (client, interaction) => {
        try {
          const guild = interaction.guild;

          if (!guild) {
            await interaction.reply({
              content: "Invalid command.",
              flags: "Ephemeral",
            });
            return;
          }

          await interaction.deferReply();

          //   make leaderbaord
          const users = await User.find({ serverID: guild.id });

          await getGquestMazeLeaderboard(
            client,
            users,
            guild,
            "maze",
            interaction
          );
        } catch (err) {
          console.error("Error in maze leaderboard callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in maze leaderboard subcommand : ", err);
    return undefined;
  }
};

export default init;
