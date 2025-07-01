import { ApplicationCommandOptionType, ChannelType } from "discord.js";
import { ISubcommand, IUser } from "../../../../utils/interfaces";
import { getGquestMazeLeaderboard } from "../../../../utils/gquestUtils";
import Config from "../../../../models/configSchema";

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

          //   make leaderbaord
          const guildConfig = await Config.findOne({
            serverID: guild.id,
          }).populate({ path: "users" });

          if (!guildConfig) {
            await interaction.editReply({ content: "Inavlid guild config" });
            return;
          }

          const { users } = guildConfig;

          await getGquestMazeLeaderboard(
            client,
            users as unknown as IUser[],
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
