import { ApplicationCommandOptionType, AttachmentBuilder, EmbedBuilder } from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";
import { leaderboardThumbnail } from "../../../../data/helperArrays";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "banlist",
        description:
          "Displays all users banned from participating in guild raids.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [],
      },

      callback: async (client, interaction) => {
        try {
          const guildId = interaction.guildId;

          if (!guildId) {
            await interaction.reply("Invalid command.");
            return;
          }

          await interaction.deferReply();

          const guildConfig = await Config.findOne({ serverID: guildId });

          if (!guildConfig) {
            await interaction.editReply("No server found");
            return;
          }

          const { raidConfig } = guildConfig;
          const { banList } = raidConfig;

          if (banList.length === 0) {
            await interaction.editReply("No users in ban list.");
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
            .setTitle("🚫   List of users banned from guild raids")
            .setColor("DarkAqua")
            .setThumbnail("attachment://thumbnail.png")
            .setDescription(bannedUsers)
            .setFooter({ text: `Total banned users : ${banList.length}` });

          await interaction.editReply({
            embeds: [bannedEmbed],
            files: [thumbnail],
          });
        } catch (err) {
          console.error("Error in raid banlist callback", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in raid banlist command", err);
    return undefined;
  }
};

export default init;
