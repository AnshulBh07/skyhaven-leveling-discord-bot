import {
  ApplicationCommandOptionType,
  AttachmentBuilder,
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
        description: "Gives complete maze related stats for a user.",
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

          const user = await User.findOne({ userID: targetUser.id });

          if (!user || !guild) {
            await interaction.editReply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
            });
            return;
          }

          const thumbnail = new AttachmentBuilder(leaderboardThumbnail).setName(
            "thumbnail.png"
          );

          const mazeStatusEmbed = new EmbedBuilder()
            .setTitle(`📊 Guild Maze Status`)
            .setColor("Blurple")
            .addFields(
              { name: "\u200b", value: `**👤 User : **<@${targetUser.id}>` },
              {
                name: "\u200b",
                value: `**📥 Pending : **${user.mazes.pending.length}`,
                inline: false,
              },
              {
                name: "\u200b",
                value: `**🏆 Rewarded : **${user.mazes.rewarded.length}`,
                inline: false,
              },
              {
                name: "",
                value: `**❌ Rejected : **${user.mazes.rejected.length}`,
                inline: true,
              },
              {
                name: "\u200b",
                value: `**📈 Contribution Score : **${getContributionScore(
                  user.mazes.rewarded.length,
                  user.mazes.rejected.length
                )}`,
                inline: false,
              },
              {
                name: "\u200b",
                value: `**⏳ Last Submission : **${
                  user.mazes.lastSubmissionDate
                    ? `<t:${Math.floor(
                        user.mazes.lastSubmissionDate.getTime() / 1000
                      )}:F>`
                    : "None"
                }`,
                inline: false,
              },
              {
                name: "\u200b",
                value: `**💰 Total Rewards : **${user.mazes.totalRewarded.toLocaleString(
                  "en-US"
                )} spina`,
                inline: false,
              },
              {
                name: "\u200b",
                value: `**📬 DM Notifications : **${
                  user.mazes.dmNotif ? "🟢 Enabled" : "🔴 Disabled"
                }`,
                inline: false,
              }
            )
            .setFooter({
              text: `${guild.name} Guild Quests`,
              iconURL: "attachment://thumbnail.png",
            })
            .setTimestamp();

          await interaction.editReply({
            embeds: [mazeStatusEmbed],
            files: [thumbnail],
          });
        } catch (err) {
          console.error("Error in maze stats subcommand callabck : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in maze stats subcommand : ", err);
    return undefined;
  }
};

export default init;
