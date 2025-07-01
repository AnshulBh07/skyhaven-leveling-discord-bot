import {
  AttachmentBuilder,
  Client,
  EmbedBuilder,
  ModalSubmitInteraction,
} from "discord.js";
import User from "../../models/userSchema";
import { leaderboardThumbnail } from "../../data/helperArrays";
import Config from "../../models/configSchema";
import GQuest from "../../models/guildQuestsSchema";
import Maze from "../../models/mazeSchema";
import { IGquest, IMaze } from "../../utils/interfaces";
import { isManager } from "../../utils/permissionsCheck";

const execute = async (client: Client, interaction: ModalSubmitInteraction) => {
  try {
    if (!interaction.isModalSubmit()) return;

    const channel = interaction.channel;
    const guild = interaction.guild;

    if (!channel || !channel.isTextBased() || !guild) return;

    await interaction.deferReply({ flags: "Ephemeral" });

    // handle config checks here after user clicks submit button

    const guildConfig = await Config.findOne({ serverID: guild.id });

    if (!guildConfig) {
      await interaction.editReply("Guild config not found.");
      return;
    }

    const { gquestMazeConfig } = guildConfig;
    const { gquestChannelID, mazeChannelID } = gquestMazeConfig;

    // return if not from gquest or maze channel
    if (!(channel.id === gquestChannelID || channel.id === mazeChannelID))
      return;

    // handle gquest rejection modal
    if (
      interaction.customId.startsWith("gq_rejection_modal") ||
      interaction.customId.startsWith("mz_rejection_modal")
    ) {
      const messageID = interaction.customId.split("_").at(-1);
      const reason = interaction.fields.getTextInputValue("reason");
      const type = interaction.customId.split("_")[0];

      const isAuthorized = await isManager(
        client,
        interaction.user.id,
        guildConfig.serverID,
        type
      );
      if (!isAuthorized) {
        await interaction.editReply({
          content: "❌ You do not have the permission to perform this action.",
        });
        return;
      }

      if (!messageID) {
        await interaction.editReply({ content: "Something went wrong." });
        return;
      }

      //   fetch and update related gquest or maze
      const gquestMaze =
        type === "gq"
          ? await GQuest.findOneAndUpdate(
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
            )
          : await Maze.findOneAndUpdate(
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

      if (!gquestMaze) {
        await interaction.editReply({
          content: "Guild Quest/Maze not found in records.",
        });
        return;
      }

      const { userID, channelID, serverID } = gquestMaze;

      const updateOptions =
        type === "gq"
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

      if (!updatedUser) {
        await interaction.editReply({ content: "No user found" });
        return;
      }

      const guild = await client.guilds.fetch(serverID);
      const channel = await guild.channels.fetch(channelID, { force: true });
      const user = await client.users.fetch(userID);

      if (!channel || channel.type !== 0) {
        await interaction.editReply({ content: "Invalid channel." });
        return;
      }

      const msg = await channel.messages.fetch(messageID);

      let gquestImage;

      if (type === "gq")
        gquestImage = new AttachmentBuilder(
          (gquestMaze as IGquest).imageUrl
        ).setName("submitted_image.png");

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
            value: `**👤 Reviewed by : **<@${interaction.user.id}>`,
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
        .setFooter({
          text: `${guild.name} Guild ${
            type.split("")[0].toUpperCase() + type.slice(1)
          }s`,
        })
        .setTimestamp();

      if (type === "gq")
        rejectEmbed.setImage("attachment://submitted_image.png");

      // maze message
      const imageUrls = (gquestMaze as IMaze).imageUrls;

      if (type === "gq" && gquestImage) {
        await msg.edit({
          embeds: [rejectEmbed],
          components: [],
          files: [thumbnail, gquestImage],
        });
      } else {
        // find the embed message
        const embedMsg = await channel.messages.fetch(
          (gquestMaze as IMaze).embedMessageID
        );

        await embedMsg.edit({ embeds: [rejectEmbed], files: [thumbnail] });
        await msg.edit({
          embeds: [],
          files: [thumbnail, ...imageUrls],
          components: [],
        });
      }

      await interaction.editReply({
        content: "✅ Rejection processed successfully.",
      });

      const sendNotif =
        type === "gq" ? updatedUser.gquests.dmNotif : updatedUser.mazes.dmNotif;

      if (sendNotif) {
        try {
          await user.send({
            embeds: [rejectEmbed],
            files:
              type === "gq"
                ? [thumbnail, gquestImage!]
                : [thumbnail, ...imageUrls],
          });
        } catch (err) {
          console.warn("Cannot send DM to user");
        }
      }
    }
  } catch (err) {
    console.error("Error in modal submission handler : ", err);
  }
};

export default execute;
