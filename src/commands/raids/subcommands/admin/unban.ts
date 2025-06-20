import { ApplicationCommandOptionType } from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "unban",
        description: "Removes a user from guild raids ban list.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "target user",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },

      callback: async (client, interaction) => {
        try {
          const targetUser = interaction.options.getUser("user");
          const guildID = interaction.guildId;

          if (!targetUser || !guildID) {
            await interaction.reply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
            });
            return;
          }

          await interaction.deferReply({ flags: "Ephemeral" });

          //   get banlist and see if the user is already banned
          const guildConfig = await Config.findOne({ serverID: guildID });

          if (!guildConfig) {
            await interaction.editReply(
              "🔍 This server could not be identified. Check if the bot has access."
            );
            return;
          }

          const { raidConfig } = guildConfig;
          const banList = raidConfig.banList;

          const isBanned = banList.some(
            (user) => user.userID === targetUser.id
          );

          if (!isBanned) {
            await interaction.editReply(
              `<@${targetUser.id}> is not present in guild raids ban list.`
            );
            return;
          }

          await Config.findOneAndUpdate(
            { serverID: guildID },
            { $pull: { "raidConfig.banList": { userID: targetUser.id } } }
          );

          await interaction.editReply(
            `<@${targetUser.id}> has been removed from ban list.`
          );
        } catch (err) {
          console.error("Error in raid unban subcommand callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in raid unban subcommand : ", err);
    return undefined;
  }
};

export default init;
