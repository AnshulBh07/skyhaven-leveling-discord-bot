import { ApplicationCommandOptionType } from "discord.js";
import { ICommandObj } from "../../../utils/interfaces";
import Config from "../../../models/configSchema";

const init = async (): Promise<ICommandObj | undefined> => {
  try {
    return {
      name: "gban",
      description: "Bans a user from participating in giveaways.",
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
      permissionsRequired: [],

      callback: async (client, interaction) => {
        try {
          const targetUser = interaction.options.getUser("user");
          const reason = interaction.options.getString("reason") ?? "";
          const guildID = interaction.guildId;

          if (!targetUser || !guildID) {
            await interaction.reply({ content: `Invalid command.` });
            return;
          }

          await interaction.deferReply({ flags: "Ephemeral" });

          //   get banlist and see if the user is already banned
          const guildConfig = await Config.findOne({ serverID: guildID });

          if (!guildConfig) {
            await interaction.editReply("Invalid server.");
            return;
          }

          const { giveawayConfig } = guildConfig;
          const banList = giveawayConfig.banList;

          const isBanned = banList.some(
            (user) => user.userID === targetUser.id
          );

          if (isBanned) {
            await interaction.editReply(
              `<@${targetUser.id}> is already banned from giveaways.`
            );
            return;
          }

          giveawayConfig.banList.push({
            userID: targetUser.id,
            reason: reason,
            banDate: new Date(),
          });

          await guildConfig.save();

          await interaction.editReply(
            `<@${targetUser.id}> has been banned from participating in any further giveaways. Use \`/gunban\` to remove user from banlist whenever you want.`
          );
        } catch (err) {
          console.error(err);
        }
      },
    };
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

export default init;
