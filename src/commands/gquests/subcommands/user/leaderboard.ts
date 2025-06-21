import { ApplicationCommandOptionType, ChannelType } from "discord.js";
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
          const channel = interaction.channel;

          if (!guild || !channel || channel.type !== ChannelType.GuildText) {
            await interaction.editReply({
              content: `⚠️ Invalid command. Please check your input and try again.`,
            });
            return;
          }

          //   make leaderbaord
          const users = await User.find({ serverID: guild.id });

          await getGquestMazeLeaderboard(
            client,
            users,
            guild,
            "guild_quest",
            interaction,
            channel
          );
        } catch (err) {
          console.error("Error in gquest leaderboard callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in gquest leaderboard subcommand : ", err);
    return undefined;
  }
};

export default init;
