import {
  ApplicationCommandOptionType,
  ChannelType,
  Colors,
  EmbedBuilder,
} from "discord.js";
import { ISubcommand } from "../../../utils/interfaces";
import Config from "../../../models/configSchema";
import { getThumbnail } from "../../../utils/commonUtils";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "ban",
        description: "Ban a user from guild",
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
            required: false,
          },
        ],
      },

      callback: async (client, interaction) => {
        try {
          const user = interaction.options.getUser("user");
          const reason = interaction.options.getString("reason");
          const guild = interaction.guild;

          if (!user || !guild || user.bot) {
            interaction.editReply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
            });
            return;
          }

          const guildConfig = await Config.findOne({ serverID: guild.id });

          if (!guildConfig) {
            await interaction.editReply(
              "🔍 This server could not be identified. Check if the bot has access."
            );
            return;
          }

          const { moderationConfig, bannedUsers } = guildConfig;
          const { banChannelID } = moderationConfig;

          const channel = await guild.channels.fetch(banChannelID, {
            force: true,
          });

          if (!channel || channel.type !== ChannelType.GuildText) {
            await interaction.editReply({ content: "Invalid channel." });
            return;
          }

          //   add to banned users of guild
          bannedUsers.addToSet({
            userID: user.id,
            reason: reason ?? "",
            banDate: new Date(),
            banBy: interaction.user.id,
          });

          const thumbnail = getThumbnail();

          //   send a message embed at channel
          const banEmbed = new EmbedBuilder()
            .setTitle("🔨 User Banned")
            .setColor(Colors.Red)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
              {
                name: "\u200b",
                value: `**👤 Banned User : **${user.tag} (\`${user.id}\`)`,
                inline: false,
              },
              {
                name: "\u200b",
                value: `**🛡️ Banned By : **${interaction.user.username} (\`${interaction.user.displayName}\`)`,
                inline: false,
              },
              {
                name: "\u200b",
                value: `**📄 Reason : **${reason || "No reason provided."}`,
                inline: false,
              }
            )
            .setFooter({
              text: "User banned from the server",
              iconURL: "attachment://thumbnail.png",
            })
            .setTimestamp();

          await channel.send({ embeds: [banEmbed], files: [thumbnail] });

          await guildConfig.save();

          await interaction.editReply({
            content: `${user.displayName} is banned from the server.`,
          });
        } catch (err) {
          console.error("Error in ban subcommand callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Cannot ban user : ", err);
    return undefined;
  }
};

export default init;
