import {
  AttachmentBuilder,
  Client,
  EmbedBuilder,
  ModalSubmitInteraction,
} from "discord.js";
import GQuest from "../../models/guildQuestsSchema";
import User from "../../models/userSchema";
import { leaderboardThumbnail } from "../../data/helperArrays";

const execute = async (client: Client, interaction: ModalSubmitInteraction) => {
  try {
    if (!interaction.isModalSubmit()) return;

    // handle gquest rejection modal
    if (interaction.customId.startsWith("gquest_rejection_modal")) {
      await interaction.deferReply({ flags: "Ephemeral" });
      const messageID = interaction.customId.split("_").at(-1);
      const reason = interaction.fields.getTextInputValue("reason");

      if (!messageID) return;

      //   fetch and update related gquest
      const gquest = await GQuest.findOneAndUpdate(
        { messageID: messageID },
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

      if (!gquest) return;

      const { userID, channelID, serverID } = gquest;

      await User.findOneAndUpdate(
        { userID: userID },
        {
          $pull: { "gquests.pending": gquest._id },
          $push: { "gquests.rejected": gquest._id },
          $set: { "gquests.lastRejectionDate": new Date() },
        },
        { new: true }
      );

      const guild = await client.guilds.fetch(serverID);
      const channel = await guild.channels.fetch(channelID);
      const user = await client.users.fetch(userID);

      if (!channel || channel.type !== 0) return;

      const msg = await channel.messages.fetch(messageID);

      const gquestImage = new AttachmentBuilder(gquest.imageUrl).setName(
        "submitted_image.png"
      );
      const thumbnail = new AttachmentBuilder(leaderboardThumbnail).setName(
        "thumbnail.png"
      );

      const rejectEmbed = new EmbedBuilder()
        .setTitle("❌ Gquest Rejected")
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
              gquest.submittedAt / 1000
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
        .setFooter({ text: `${guild.name} Guild Quests` })
        .setTimestamp();

      await msg.edit({
        embeds: [rejectEmbed],
        components: [],
        files: [thumbnail, gquestImage],
      });

      await interaction.editReply({
        content: "✅ Rejection processed successfully.",
      });

      await user.send({
        embeds: [rejectEmbed],
        files: [thumbnail, gquestImage],
      });
    }
  } catch (err) {
    console.error("Error in modal submission handler : ", err);
  }
};

export default execute;
