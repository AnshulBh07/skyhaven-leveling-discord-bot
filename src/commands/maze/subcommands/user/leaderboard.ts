import { ApplicationCommandOptionType, ChannelType } from "discord.js";
import { ISubcommand, IUser } from "../../../../utils/interfaces";
import { getGquestMazeLeaderboard } from "../../../../utils/gquestUtils";
import Config from "../../../../models/configSchema";
import User from "../../../../models/userSchema";

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
          const channel = interaction.channel;

          if (!guild || !channel || channel.type !== ChannelType.GuildText) {
            await interaction.editReply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
            });
            return;
          }

          //   make leaderboard with lean and projection
          const users = (await User.find(
            { serverID: guild.id },
            { userID: 1, mazes: 1 }
          ).lean()) as unknown as IUser[];

          await getGquestMazeLeaderboard(
            client,
            users,
            guild,
            "maze",
            interaction,
            channel
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
