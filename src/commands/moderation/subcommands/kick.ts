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
        name: "kick",
        description: "Kick a user from guild",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "user to kick",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "reason",
            description: "reason for kick",
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

          const { moderationConfig, kickedUsers } = guildConfig;
          const { kickChannelID } = moderationConfig;

          const channel = await guild.channels.fetch(kickChannelID, {
            force: true,
          });

          if (!channel || channel.type !== ChannelType.GuildText) {
            await interaction.editReply({ content: "Invalid channel." });
            return;
          }

          //   add to banned users of guild
          kickedUsers.addToSet({
            userID: user.id,
            reason: reason ?? "",
            kickDate: new Date(),
            kickBy: interaction.user.id,
          });

          const thumbnail = getThumbnail();

          //   send a message embed at channel
          const kickEmbed = new EmbedBuilder()
            .setTitle("🦵 User Kicked")
            .setColor(Colors.Red)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
              {
                name: "\u200b",
                value: `**👤 Kicked User : **${user.tag} (\`${user.id}\`)`,
                inline: false,
              },
              {
                name: "\u200b",
                value: `**🛡️ Kicked By : **${interaction.user.username} (\`${interaction.user.displayName}\`)`,
                inline: false,
              },
              {
                name: "\u200b",
                value: `**📄 Reason : **${reason || "No reason provided."}`,
                inline: false,
              }
            )
            .setFooter({
              text: "User kicked from the server",
              iconURL: "attachment://thumbnail.png",
            })
            .setTimestamp();

          await channel.send({ embeds: [kickEmbed], files: [thumbnail] });

          await guildConfig.save();

          await interaction.editReply({
            content: `${user.displayName} was kicked from the server.`,
          });
        } catch (err) {
          console.error("Error in kick subcommand callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Cannot kick user : ", err);
    return undefined;
  }
};

export default init;
