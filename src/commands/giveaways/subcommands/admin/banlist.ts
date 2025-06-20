import {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  EmbedBuilder,
} from "discord.js";
import Config from "../../../../models/configSchema";
import { ISubcommand } from "../../../../utils/interfaces";
import { leaderboardThumbnail } from "../../../../data/helperArrays";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "banlist",
        description: "Displays all users banned from giveaways.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [],
      },

      callback: async (client, interaction) => {
        try {
          const guildId = interaction.guildId;

          if (!guildId) {
            await interaction.editReply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
            });
            return;
          }

          const guildConfig = await Config.findOne({ serverID: guildId });

          if (!guildConfig) {
            await interaction.editReply(
              "🔍 This server could not be identified. Check if the bot has access."
            );
            return;
          }

          const { giveawayConfig } = guildConfig;
          const { banList } = giveawayConfig;

          if (banList.length === 0) {
            await interaction.editReply(
              "🔓 No banned users found in this server."
            );
            return;
          }

          const bannedUsers = banList
            .map(
              (user, index) =>
                `${index + 1}. <@${user.userID}> - ${user.reason} (${
                  user.banDate.toISOString().split("T")[0]
                })`
            )
            .join("\n");

          const thumbnail = new AttachmentBuilder(leaderboardThumbnail).setName(
            "thumbnail.png"
          );

          const bannedEmbed = new EmbedBuilder()
            .setTitle("🚫   List of users banned from giveaway")
            .setColor("DarkAqua")
            .setThumbnail("attachment://thumbnail.png")
            .setDescription(bannedUsers)
            .setFooter({ text: `Total banned users : ${banList.length}` });

          await interaction.editReply({
            embeds: [bannedEmbed],
            files: [thumbnail],
          });
        } catch (err) {
          console.error("Error in giveaway banlist callback", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in giveaway banlist command", err);
    return undefined;
  }
};

export default init;
