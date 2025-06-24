import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
} from "discord.js";
import { IGquest, ISubcommand } from "../../../../utils/interfaces";
import { leaderboardThumbnail } from "../../../../data/helperArrays";
import User from "../../../../models/userSchema";
import GQuest from "../../../../models/guildQuestsSchema";
import { attachQuestMazeReviewCollector } from "../../../../utils/gquestUtils";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "submit",
        description: "Submit a gquest for yourself or some other user.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "image",
            description:
              "Ingame screenshot. Without this your submission will be rejected.",
            type: ApplicationCommandOptionType.Attachment,
            required: true,
          },
          {
            name: "user",
            description: "target user",
            type: ApplicationCommandOptionType.User,
          },
        ],
      },

      callback: async (client, interaction) => {
        try {
          const targetUser = interaction.options.getUser("user");
          const gquestImage = interaction.options.getAttachment("image");
          const channel = interaction.channel;
          const guild = interaction.guild;

          if (
            !gquestImage ||
            !channel ||
            channel.type !== ChannelType.GuildText ||
            !guild
          ) {
            await interaction.editReply({
              content: `⚠️ Invalid command. Please check your input and try again.`,
            });
            return;
          }

          // find user
          const user = await User.findOne({
            userID: targetUser ? targetUser.id : interaction.user.id,
          });

          if (!user) {
            await interaction.editReply({ content: "User not found." });
            return;
          }

          const { gquests } = user;

          const thumbnail = new AttachmentBuilder(leaderboardThumbnail).setName(
            "thumbnail.png"
          );

          const submissionImage = new AttachmentBuilder(
            gquestImage.url
          ).setName("submitted_image.png");

          const submissionEmbed = new EmbedBuilder()
            .setTitle("🧾 Gquest Submission")
            .setDescription(
              `Thank you for your submission! 🔍\n` +
                `Our team will review it shortly. If everything checks out, you’ll be rewarded soon. 🎉`
            )
            .setColor("Aqua")
            .setThumbnail("attachment://thumbnail.png")
            .addFields(
              {
                name: "\u200b",
                value: `**📤 Submitted by : **<@${interaction.user.id}>`,
                inline: false,
              },
              ...(targetUser
                ? [
                    {
                      name: "\u200b",
                      value: `**🎯 For : **<@${targetUser.id}>`,
                      inline: false,
                    },
                  ]
                : []),
              {
                name: "\u200b",
                value: `**🕒 Submitted On : **<t:${Math.floor(
                  Date.now() / 1000
                )}:F>`,
              },
              {
                name: "\u200b",
                value: `**📌 Status : **${"Pending"}`,
                inline: false,
              },
              {
                name: "👤 User Status",
                value: `**Total Pending : **${
                  gquests.pending.length + 1
                }\n**Total Rewarded : **${gquests.rewarded.length}`,
                inline: false,
              }
            )
            .setFooter({ text: `${guild.name} Guild Quests` })
            .setImage("attachment://submitted_image.png")
            .setTimestamp();

          await interaction.editReply({ content: "Please wait...." });

          // send interaction reply
          const reply = await channel.send({
            embeds: [submissionEmbed],
            files: [submissionImage, thumbnail],
          });

          // insert a new gquest submission in db
          const gquestOptions: IGquest = {
            serverID: guild.id,
            userID: targetUser ? targetUser.id : interaction.user.id,
            messageID: reply.id,
            channelID: channel.id,
            imageUrl: gquestImage.url,
            imageHash: "dummy hash",
            status: "pending",
            reviewedBy: "none",
            submittedAt: Date.now(),
          };

          const newGquest = new GQuest(gquestOptions);
          await newGquest.save();

          // update user
          user.gquests.lastSubmissionDate = new Date();
          user.gquests.pending.push(newGquest._id);
          await user.save();

          // create buttons and edit reply again, we didn't create them before to avoid interaction failure
          const buttonsRow =
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setCustomId("reward")
                .setEmoji("💵")
                .setStyle(ButtonStyle.Secondary),
              new ButtonBuilder()
                .setCustomId("reject")
                .setEmoji("❌")
                .setStyle(ButtonStyle.Secondary)
            );

          // edit embed
          submissionEmbed.addFields({
            name: "\u200b",
            value: `**🪪 Submission ID : **\`${reply.id}\``,
          });

          await reply.edit({
            embeds: [submissionEmbed],
            components: [buttonsRow],
          });

          // attach collectors to this gquest message
          await attachQuestMazeReviewCollector(
            client,
            newGquest as IGquest,
            "gquest"
          );
        } catch (err) {
          console.error("Error in gquest submit subcommand callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in gquest submit subcommand :", err);
    return undefined;
  }
};

export default init;
