import {
  ActionRowBuilder,
  AttachmentBuilder,
  Client,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { IGquest } from "./interfaces";
import Config from "../models/configSchema";
import User from "../models/userSchema";
import GQuest from "../models/guildQuestsSchema";
import { leaderboardThumbnail } from "../data/helperArrays";

export const attachGquestCollector = async (
  client: Client,
  gquestData: IGquest
) => {
  try {
    const guild = await client.guilds.fetch(gquestData.serverID);
    const channel = await guild.channels.fetch(gquestData.channelID);
    const guildConfig = await Config.findOne({ serverID: guild.id });

    if (!channel || channel.type !== 0 || !guildConfig) return;

    const message = await channel.messages.fetch(gquestData.messageID);

    const { gquestConfig } = guildConfig;
    const { managerRoles, rewardAmount } = gquestConfig;

    const thumbnail = new AttachmentBuilder(leaderboardThumbnail).setName(
      "thumbnail.png"
    );
    const submissionImage = new AttachmentBuilder(gquestData.imageUrl).setName(
      "submitted_image.png"
    );

    // attach collector
    const collector = message.createMessageComponentCollector({
      filter: (i) => ["reward", "reject"].includes(i.customId),
      time: 0,
    });

    collector.on("collect", async (btnInt) => {
      try {
        // check if the interaction is for valid user or not
        // interactor must have one of the roles from managerRoles
        const member = guild.members.cache.find(
          (member) => member.id === gquestData.userID
        );

        if (!member) return;

        const member_roles = Array.from(member.roles.cache.entries()).map(
          ([_, role]) => role.id
        );

        let hasRole = false;
        for (const role of member_roles) {
          if (managerRoles.includes(role)) {
            hasRole = true;
            break;
          }
        }

        // if (!hasRole) {
        //   await btnInt.editReply({
        //     content: "You do not have the permission to perform this action.",
        //   });
        //   return;
        // }

        // manage button click now
        if (btnInt.customId === "reward") {
          await btnInt.deferReply({ flags: "Ephemeral" });

          // change gquest status, update user and edit message
          const updatedGquest = await GQuest.findOneAndUpdate(
            {
              messageID: message.id,
            },
            {
              $set: {
                status: "rewarded",
                rewardedAt: Date.now(),
                reviewedBy: btnInt.user.id,
              },
            },
            { new: true }
          );

          const newUser = await User.findOneAndUpdate(
            { userID: gquestData.userID },
            {
              $pull: { "gquests.pending": updatedGquest?._id },
              $push: { "gquests.rewarded": updatedGquest?._id },
              $set: { "gquests.lastRewardedAt": new Date() },
              $inc: { "gquests.totalRewarded": rewardAmount },
            },
            { new: true }
          );

          //   create a new embed
          const submissionEmbed = new EmbedBuilder()
            .setTitle("💵 Gquest Rewarded")
            .setColor("Aqua")
            .setThumbnail("attachment://thumbnail.png")
            .addFields(
              {
                name: "\u200b",
                value: `**📤 Submitted by : **<@${gquestData.userID}>`,
                inline: false,
              },
              {
                name: "\u200b",
                value: `**📝 Reviewed by : **<@${btnInt.user.id}>`,
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
                value: `**Total Pending : **${newUser?.gquests.pending.length}\n**Total Rewarded : **${newUser?.gquests.rewarded.length}`,
                inline: false,
              },
              {
                name: "\u200b",
                value: `**🪪 Guild Quest ID : **\`${gquestData.messageID}\``,
                inline: false,
              }
            )
            .setFooter({ text: `${guild.name} Guild Quests` })
            .setImage("attachment://submitted_image.png")
            .setTimestamp();

          await message.edit({
            embeds: [submissionEmbed],
            files: [submissionImage, thumbnail],
            components: [],
          });

          await btnInt.editReply(
            `Gquest rewarded for user <@${gquestData.userID}>`
          );
        }

        if (btnInt.customId === "reject") {
          // display a modal to user
          const modal = new ModalBuilder()
            .setCustomId(`gquest_rejection_modal_${gquestData.messageID}`)
            .setTitle("Guild Quest Rejection");

          const reasonInput =
            new ActionRowBuilder<TextInputBuilder>().addComponents(
              new TextInputBuilder()
                .setCustomId("reason")
                .setLabel("Reason : ")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
            );

          modal.addComponents(reasonInput);

          await btnInt.showModal(modal);
        }
      } catch (err) {
        console.error("Error in gquest collector collect event : ", err);
      }
    });
  } catch (err) {
    console.error("Error in gquest collector function : ", err);
  }
};
