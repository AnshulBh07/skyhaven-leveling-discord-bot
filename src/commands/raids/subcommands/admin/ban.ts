import { ApplicationCommandOptionType } from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "ban",
        description: "Bans a user from participating in guild raids",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "user to ban",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "reason",
            description: "reason for ban",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },

      callback: async (client, interaction) => {
        try {
          const targetUser = interaction.options.getUser("user");
          const reason = interaction.options.getString("reason") ?? "";
          const guildID = interaction.guildId;

          if (!targetUser || !guildID) {
            await interaction.editReply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
            });
            return;
          }

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

          if (isBanned) {
            await interaction.editReply(
              `<@${targetUser.id}> is already banned from guild raids.`
            );
            return;
          }

          raidConfig.banList.push({
            userID: targetUser.id,
            reason: reason,
            banDate: new Date(),
          });

          await guildConfig.save();

          await interaction.editReply(
            `<@${targetUser.id}> has been banned from participating in any further guild raids. Use \`/raid unban\` to remove user from banlist whenever you want.`
          );
        } catch (err) {
          console.error("Error in raid ban subcommand callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in raid ban subcommand : ", err);
    return undefined;
  }
};

export default init;
