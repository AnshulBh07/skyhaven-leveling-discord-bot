import {
  AttachmentBuilder,
  Client,
  EmbedBuilder,
  ModalSubmitInteraction,
} from "discord.js";
import User from "../../models/userSchema";
import { leaderboardThumbnail } from "../../data/helperArrays";
import GQuestMaze from "../../models/guildQuestsMazesSchema";

const execute = async (client: Client, interaction: ModalSubmitInteraction) => {
  try {
    if (!interaction.isModalSubmit()) return;

    // handle gquest rejection modal
    if (
      interaction.customId.startsWith("gquest_rejection_modal") ||
      interaction.customId.startsWith("maze_rejection_modal")
    ) {
      await interaction.deferReply({ flags: "Ephemeral" });
      const messageID = interaction.customId.split("_").at(-1);
      const reason = interaction.fields.getTextInputValue("reason");
      const type = interaction.customId.split("_")[0];

      if (!messageID) return;

      //   fetch and update related gquest
      const gquestMaze = await GQuestMaze.findOneAndUpdate(
        { messageID: messageID, type: type },
        {
          $set: {
            status: "rejected",
            rejectedAt: Date.now(),
            rejectionReason: reason,
            reviewedBy: interaction.user.id,
          },
        },
        { new: true }
      );

      if (!gquestMaze) return;

      const { userID, channelID, serverID } = gquestMaze;

      const updateOptions =
        type === "gquest"
          ? {
              $pull: { "gquests.pending": gquestMaze._id },
              $push: { "gquests.rejected": gquestMaze._id },
              $set: { "gquests.lastRejectionDate": new Date() },
            }
          : {
              $pull: { "mazes.pending": gquestMaze._id },
              $push: { "mazes.rejected": gquestMaze._id },
              $set: { "mazes.lastRejectionDate": new Date() },
            };

      const updatedUser = await User.findOneAndUpdate(
        { userID: userID },
        updateOptions,
        { new: true }
      );

      if (!updatedUser) return;

      const guild = await client.guilds.fetch(serverID);
      const channel = await guild.channels.fetch(channelID);
      const user = await client.users.fetch(userID);

      if (!channel || channel.type !== 0) return;

      const msg = await channel.messages.fetch(messageID);

      const gquestImage = new AttachmentBuilder(gquestMaze.imageUrl).setName(
        "submitted_image.png"
      );
      const thumbnail = new AttachmentBuilder(leaderboardThumbnail).setName(
        "thumbnail.png"
      );

      const rejectEmbed = new EmbedBuilder()
        .setTitle(`❌ ${type} Rejected`)
        .setThumbnail("attachment://thumbnail.png")
        .setColor("Red")
        .addFields(
          {
            name: "\u200b",
            value: `**📤 Submitted by :**<@${userID}>`,
            inline: false,
          },
          {
            name: "\u200b",
            value: `**👤 Reviewed by : **<@${userID}>`,
            inline: false,
          },
          {
            name: "\u200b",
            value: `**Reason : **${reason}`,
            inline: false,
          },
          {
            name: "\u200b",
            value: `**🕒 Submitted On : **<t:${Math.floor(
              gquestMaze.submittedAt / 1000
            )}:F>`,
            inline: false,
          },
          {
            name: "\u200b",
            value: `**🕒 Rejected On : **<t:${Math.floor(
              Date.now() / 1000
            )}:F>`,
            inline: false,
          }
        )
        .setImage("attachment://submitted_image.png")
        .setFooter({
          text: `${guild.name} Guild ${
            type.split("")[0].toUpperCase() + type.slice(1)
          }s`,
        })
        .setTimestamp();

      await msg.edit({
        embeds: [rejectEmbed],
        components: [],
        files: [thumbnail, gquestImage],
      });

      await interaction.editReply({
        content: "✅ Rejection processed successfully.",
      });

      const sendNotif =
        type === "gquest"
          ? updatedUser.gquests.dmNotif
          : updatedUser.mazes.dmNotif;

      if (sendNotif) {
        try {
          await user.send({
            embeds: [rejectEmbed],
            files: [thumbnail, gquestImage],
          });
        } catch (err) {
          console.warn("Cannot sen DM to user");
        }
      }
    }
  } catch (err) {
    console.error("Error in modal submission handler : ", err);
  }
};

export default execute;
