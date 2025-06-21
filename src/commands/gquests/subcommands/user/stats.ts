import {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  ChannelType,
  EmbedBuilder,
} from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import User from "../../../../models/userSchema";
import { leaderboardThumbnail } from "../../../../data/helperArrays";
import { getContributionScore } from "../../../../utils/gquestUtils";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "stats",
        description: "Gives complete gquest related stats for a user.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "target user",
            type: ApplicationCommandOptionType.User,
            required: false,
          },
        ],
      },

      callback: async (client, interaction) => {
        try {
          const targetUser =
            interaction.options.getUser("user") ?? interaction.user;
          const guild = interaction.guild;
          const channel = interaction.channel;

          const user = await User.findOne({ userID: targetUser.id });

          if (
            !user ||
            !guild ||
            !channel ||
            channel.type !== ChannelType.GuildText
          ) {
            await interaction.editReply({
              content: `⚠️ Invalid command. Please check your input and try again.`,
            });
            return;
          }

          const thumbnail = new AttachmentBuilder(leaderboardThumbnail).setName(
            "thumbnail.png"
          );

          const gquestStatusEmbed = new EmbedBuilder()
            .setTitle(`📊 Guild Quest Status`)
            .setColor("Blurple")
            .setThumbnail("attachment://thumbnail.png")
            .addFields(
              { name: "\u200b", value: `**👤 User : **<@${targetUser.id}>` },
              {
                name: "\u200b",
                value: `**📥 Pending : **${user.gquests.pending.length}`,
                inline: false,
              },
              {
                name: "\u200b",
                value: `**🏆 Rewarded : **${user.gquests.rewarded.length}`,
                inline: false,
              },
              {
                name: "",
                value: `**❌ Rejected : **${user.gquests.rejected.length}`,
                inline: true,
              },
              {
                name: "\u200b",
                value: `**📈 Contribution Score : **${getContributionScore(
                  user.gquests.rewarded.length,
                  user.gquests.rejected.length
                )}`,
                inline: false,
              },
              {
                name: "\u200b",
                value: `**⏳ Last Submission : **${
                  user.gquests.lastSubmissionDate
                    ? `<t:${Math.floor(
                        user.gquests.lastSubmissionDate.getTime() / 1000
                      )}:F>`
                    : "None"
                }`,
                inline: false,
              },
              {
                name: "\u200b",
                value: `**💰 Total Rewards : **${user.gquests.totalRewarded}`,
                inline: false,
              },
              {
                name: "\u200b",
                value: `**📬 DM Notifications : **${
                  user.gquests.dmNotif ? "🟢 Enabled" : "🔴 Disabled"
                }`,
                inline: false,
              }
            )
            .setFooter({ text: `${guild.name} Guild Quests` })
            .setTimestamp();

          await interaction.editReply({
            embeds: [gquestStatusEmbed],
            files: [thumbnail],
          });
        } catch (err) {
          console.error("Error in gquest stats subcommand callabck : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in stats subcommand : ", err);
    return undefined;
  }
};

export default init;
