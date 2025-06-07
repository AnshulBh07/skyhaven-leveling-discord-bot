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
import GQuest from "../../models/guildQuestsSchema";
import User from "../../models/userSchema";
import { leaderboardThumbnail } from "../../data/helperArrays";

// this file handles reward submission for gquest channel and guild mazes channel
const execute = async (client: Client, message: Message) => {
  try {
    const guild = message.guild;
    const channel = message.channel;

    if (!guild || !channel.isTextBased()) return;

    // check if it's a valid message from the manager role and respective channel
    const guildConfig = await Config.findOne({ serverID: guild.id });
    if (!guildConfig) return;

    const { gquestConfig } = guildConfig;

    const thumbnail = new AttachmentBuilder(leaderboardThumbnail).setName(
      "thumbnail.png"
    );

    // if it is for gquest
    if (channel.id === gquestConfig.gquestChannelID && channel.isTextBased()) {
      // get role of user who messaged and compare with the manager role
      const user = message.author;

      if (user.bot) return;

      const member = await guild.members.fetch(user.id);
      const roles = Array.from(member.roles.cache.entries()).map(
        ([_, role]) => role.id
      );

      const managerRoles = gquestConfig.managerRoles;
      let hasRole = false;

      for (const role of roles) {
        if (managerRoles.includes(role)) {
          hasRole = true;
          break;
        }
      }

      if (!hasRole) return;

      //   message author has manager role
      const currTime = Date.now();
      const threshold = 2 * 60 * 1000; // 2 minutes in ms
      //   we need to fetch correct data from db but we do not have enough information so we assume that
      // the latest reward button click is the gquest message that user interacted with
      const gquest = await GQuest.findOne({ serverID: guild.id }).sort({
        lastRewardBtnClickAt: -1,
      });

      if (!gquest) return;

      const lastBtnClick = gquest.lastRewardBtnClickAt;
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
        await message.reply("Invalid submission. Please try again.");
        return;
      }

      //  validation ends here, we start updating
      const proofImage = new AttachmentBuilder(attachments[0].url).setName(
        "proof_image.png"
      );

      // change gquest status, update user and edit message
      const updatedGquest = await GQuest.findOneAndUpdate(
        {
          messageID: gquest.messageID,
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

      if (!updatedGquest) return;

      const newUser = await User.findOneAndUpdate(
        { userID: gquest.userID },
        {
          $pull: { "gquests.pending": updatedGquest._id },
          $push: { "gquests.rewarded": updatedGquest._id },
          $set: { "gquests.lastRewardedAt": new Date() },
          $inc: { "gquests.totalRewarded": gquestConfig.rewardAmount },
        },
        { new: true }
      );

      if (!newUser) return;

      // send a reward message to the associated channel
      const rewardEmbed = new EmbedBuilder()
        .setTitle("💵 Gquest Rewarded")
        .setColor("Aqua")
        .setThumbnail("attachment://thumbnail.png")
        .addFields(
          {
            name: "\u200b",
            value: `**📤 Submitted by : **<@${gquest.userID}>`,
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
            value: `**Total Pending : **${newUser.gquests.pending.length}\n**Total Rewarded : **${newUser?.gquests.rewarded.length}`,
            inline: false,
          },
          {
            name: "\u200b",
            value: `**🪪 Guild Quest ID : **\`${gquest.messageID}\``,
            inline: false,
          }
        )
        .setFooter({ text: `${guild.name} Guild Quests` })
        .setImage("attachment://proof_image.png")
        .setTimestamp();

      // send a message on channel
      const rewardMessage = await (channel as TextChannel).send({
        embeds: [rewardEmbed],
        files: [proofImage, thumbnail],
      });

      // update gquest model
      updatedGquest.rewardMessageID = rewardMessage.id;
      updatedGquest.proofImageUrl = attachments[0].url;
      await updatedGquest.save();

      const submissionImage = new AttachmentBuilder(gquest.imageUrl).setName(
        "submitted_image.png"
      );

      //   create a new embed
      const submissionEmbed = new EmbedBuilder()
        .setTitle("💵 Gquest Rewarded")
        .setColor("Aqua")
        .setThumbnail("attachment://thumbnail.png")
        .addFields(
          {
            name: "\u200b",
            value: `**📤 Submitted by : **<@${gquest.userID}>`,
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
      const submissionMessage = await channel.messages.fetch(gquest.messageID);

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
    }
  } catch (err) {
    console.error("Error in gquest reward image submission : ", err);
  }
};

export default execute;
