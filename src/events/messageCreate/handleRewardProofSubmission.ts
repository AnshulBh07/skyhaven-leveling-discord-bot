import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  EmbedBuilder,
  Message,
  TextChannel,
} from "discord.js";
import Config from "../../models/configSchema";
import User from "../../models/userSchema";
import { leaderboardThumbnail } from "../../data/helperArrays";
import GQuestMaze from "../../models/guildQuestsMazesSchema";

// this file handles reward submission for gquest channel and guild mazes channel
const execute = async (client: Client, message: Message) => {
  try {
    const guild = message.guild;
    const channel = message.channel;

    if (!guild || !channel.isTextBased()) return;

    // check if it's a valid message from the manager role and respective channel
    const guildConfig = await Config.findOne({ serverID: guild.id });
    if (!guildConfig) return;

    const { gquestMazeConfig } = guildConfig;

    const thumbnail = new AttachmentBuilder(leaderboardThumbnail).setName(
      "thumbnail.png"
    );

    // if it is for gquest or maze
    if (
      (channel.id === gquestMazeConfig.gquestChannelID ||
        channel.id === gquestMazeConfig.mazeChannelID) &&
      channel.isTextBased() &&
      channel.isSendable()
    ) {
      // get role of user who messaged and compare with the manager role
      const user = message.author;
      const type =
        channel.id === gquestMazeConfig.gquestChannelID ? "gquest" : "maze";

      if (user.bot) return;

      const member = await guild.members.fetch(user.id);
      const roles = Array.from(member.roles.cache.entries()).map(
        ([_, role]) => role.id
      );

      const managerRoles = gquestMazeConfig.managerRoles;
      let hasRole = false;

      for (const role of roles) {
        if (managerRoles.includes(role)) {
          hasRole = true;
          break;
        }
      }

      if (!hasRole) {
        await channel.send({
          content: "❌ You do not have permission to perform this action.",
        });
        await message.delete();
        return;
      }

      //   message author has manager role
      const currTime = Date.now();
      const threshold = 2 * 60 * 1000; // 2 minutes in ms
      //   we need to fetch correct data from db but we do not have enough information so we assume that
      // the latest reward button click is the gquest message that user interacted with
      const gquestMaze = await GQuestMaze.findOne({
        serverID: guild.id,
        type: type,
      }).sort({
        lastRewardBtnClickAt: -1,
      });

      if (!gquestMaze) return;

      const lastBtnClick = gquestMaze.lastRewardBtnClickAt;
      //   return a timeout message
      if (!lastBtnClick || currTime - lastBtnClick > threshold) {
        await message.reply({
          content:
            "⏰ Submission window has expired (2 minutes). Please click the reward button again.",
        });
        return;
      }

      // validate submission
      // 2 images not allowed, should be an image only
      const attachments = Array.from(message.attachments.entries()).map(
        ([_, attachment]) => attachment
      );

      if (
        attachments.length === 0 ||
        attachments.length > 1 ||
        !attachments[0].contentType?.startsWith("image/") ||
        !attachments[0].url
      ) {
        await channel.send("Invalid submission. Please try again.");
        await message.delete();
        return;
      }

      //  validation ends here, we start updating
      const proofImage = new AttachmentBuilder(attachments[0].url).setName(
        "proof_image.png"
      );

      // change gquest status, update user and edit message
      const updatedGquestMaze = await GQuestMaze.findOneAndUpdate(
        {
          messageID: gquestMaze.messageID,
          type: type,
        },
        {
          $set: {
            status: "rewarded",
            rewardedAt: Date.now(),
            reviewedBy: message.author.id,
          },
        },
        { new: true }
      );

      if (!updatedGquestMaze) return;

      const updateOptions =
        type === "gquest"
          ? {
              $pull: { "gquests.pending": updatedGquestMaze._id },
              $push: { "gquests.rewarded": updatedGquestMaze._id },
              $set: { "gquests.lastRewardedAt": new Date() },
              $inc: {
                "gquests.totalRewarded": gquestMazeConfig.gquestRewardAmount,
              },
            }
          : {
              $pull: { "mazes.pending": updatedGquestMaze._id },
              $push: { "mazes.rewarded": updatedGquestMaze._id },
              $set: { "mazes.lastRewardedAt": new Date() },
              $inc: {
                "mazes.totalRewarded": gquestMazeConfig.mazeRewardAmount,
              },
            };

      const newUser = await User.findOneAndUpdate(
        { userID: gquestMaze.userID },
        updateOptions,
        { new: true }
      );

      if (!newUser) return;

      // send a reward message to the associated channel
      const rewardEmbed = new EmbedBuilder()
        .setTitle(
          `💵 ${type.split("")[0].toUpperCase() + type.slice(1)} Rewarded`
        )
        .setColor("Aqua")
        .setThumbnail("attachment://thumbnail.png")
        .addFields(
          {
            name: "\u200b",
            value: `**📤 Submitted by : **<@${gquestMaze.userID}>`,
            inline: false,
          },
          {
            name: "\u200b",
            value: `**📝 Reviewed by : **<@${message.author.id}>`,
            inline: false,
          },
          {
            name: "\u200b",
            value: `**🕒 Rewarded On : **<t:${Math.floor(
              Date.now() / 1000
            )}:F>`,
          },
          {
            name: "👤 User Status",
            value: `**Total Pending : **${
              type === "gquest"
                ? newUser.gquests.pending.length
                : newUser.mazes.pending.length
            }\n**Total Rewarded : **${
              type === "gquest"
                ? newUser.gquests.rewarded.length
                : newUser.mazes.rewarded.length
            }`,
            inline: false,
          },
          {
            name: "\u200b",
            value: `**🪪 ${
              type.split("")[0].toUpperCase() + type.slice(1)
            } ID : **\`${gquestMaze.messageID}\``,
            inline: false,
          }
        )
        .setFooter({ text: `${guild.name} Guild Quests and Mazes` })
        .setImage("attachment://proof_image.png")
        .setTimestamp();

      // send a message on channel
      const rewardMessage = await (channel as TextChannel).send({
        embeds: [rewardEmbed],
        files: [proofImage, thumbnail],
      });

      // update gquest model
      updatedGquestMaze.rewardMessageID = rewardMessage.id;
      updatedGquestMaze.proofImageUrl = attachments[0].url;
      await updatedGquestMaze.save();

      const submissionImage = new AttachmentBuilder(
        gquestMaze.imageUrl
      ).setName("submitted_image.png");

      //   create a new embed
      const submissionEmbed = new EmbedBuilder()
        .setTitle(
          `💵 ${type.split("")[0].toUpperCase() + type.slice(1)} Rewarded`
        )
        .setColor("Aqua")
        .setThumbnail("attachment://thumbnail.png")
        .addFields(
          {
            name: "\u200b",
            value: `**📤 Submitted by : **<@${gquestMaze.userID}>`,
            inline: false,
          },
          {
            name: "\u200b",
            value: `**📝 Reviewed by : **<@${message.author.id}>`,
            inline: false,
          },
          {
            name: "\u200b",
            value: `**🕒 Rewarded On : **<t:${Math.floor(
              Date.now() / 1000
            )}:F>`,
          }
        )
        .setFooter({ text: `${guild.name} Guild Quests` })
        .setImage("attachment://submitted_image.png")
        .setTimestamp();

      // get the submission message form channel
      const submissionMessage = await channel.messages.fetch(
        gquestMaze.messageID
      );

      const messageLink = `https://discord.com/channels/${guild.id}/${channel.id}/${rewardMessage.id}`;

      const LinkButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel("Jump to reward message")
          .setURL(messageLink)
          .setStyle(ButtonStyle.Link)
      );

      await submissionMessage.edit({
        embeds: [submissionEmbed],
        files: [submissionImage, thumbnail],
        components: [LinkButton],
      });

      // finally delete the photo message
      await message.delete();

      const sendNotif =
        type === "gquest"
          ? newUser.gquests.dmNotif
          : newUser.mazes.dmNotif;

      // send at dm
      if (sendNotif) {
        try {
          const targetUser = await client.users.fetch(gquestMaze.userID);
          await targetUser.send({
            embeds: [rewardEmbed],
            files: [proofImage, thumbnail],
          });
        } catch (err) {
          console.warn("Cannot sen DM to user");
        }
      }
    }
  } catch (err) {
    console.error("Error in gquest reward image submission : ", err);
  }
};

export default execute;
