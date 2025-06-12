import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Client,
  DiscordAPIError,
  EmbedBuilder,
  Guild,
  ModalBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { IGquest, IMaze, IUser, questMazeLeaderboardUser } from "./interfaces";
import Config from "../models/configSchema";
import { leaderboardThumbnail } from "../data/helperArrays";
import { generateGquestMazeLeaderboardImage } from "../canvas/generateGquestMazeLeaderboardImage";
import GQuest from "../models/guildQuestsSchema";
import Maze from "../models/mazeSchema";
import User from "../models/userSchema";

const thumbnail = new AttachmentBuilder(leaderboardThumbnail).setName(
  "thumbnail.png"
);

export const attachQuestMazeReviewCollector = async (
  client: Client,
  gquestMazeData: IGquest | IMaze,
  type = "gquest"
) => {
  try {
    const guild = await client.guilds.fetch(gquestMazeData.serverID);
    const channel = await guild.channels.fetch(gquestMazeData.channelID);

    if (!channel || channel.type !== 0) return;

    const message = await channel.messages.fetch(gquestMazeData.messageID);

    // attach collector
    const collector = message.createMessageComponentCollector({
      filter: (i) => ["reward", "reject"].includes(i.customId),
      time: 0,
    });

    collector.on("collect", async (btnInt) => {
      try {
        const guildConfig = await Config.findOne({ serverID: guild.id });
        if (!guildConfig) return;

        const { gquestMazeConfig } = guildConfig;

        if (!gquestMazeConfig) return;

        const { managerRoles } = gquestMazeConfig;

        // check if the interaction is for valid user or not
        // interactor must have one of the roles from managerRoles
        const member = guild.members.cache.find(
          (member) => member.id === gquestMazeData.userID
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

        if (!hasRole) {
          await btnInt.reply({
            content: "You do not have the permission to perform this action.",
            flags: "Ephemeral",
          });
          return;
        }

        // manage button click now
        // rejection opens a modal whereas rewarding asks for a screenshot from user
        // rewarding will be handled in message create event
        if (btnInt.customId === "reward") {
          await btnInt.deferReply({ flags: "Ephemeral" });

          if (type === "gquest")
            await GQuest.findOneAndUpdate(
              { messageID: gquestMazeData.messageID },
              { $set: { lastRewardBtnClickAt: Date.now() } }
            );

          if (type === "maze")
            await Maze.findOneAndUpdate(
              {
                messageID: gquestMazeData.messageID,
              },
              { $set: { lastRewardBtnClickAt: Date.now() } }
            );

          // create a thread that will be used by admin to submit proof within 2 minutes
          const proofSubThread = await channel.threads.create({
            name: `${member.user.username} Reward Proof Submission by Admin`,
            autoArchiveDuration: 60,
          });

          await proofSubThread.send({
            content: `Please send the ingame screenshot of reward trade with user <@${gquestMazeData.userID}>. Please submit it within the next 2 minutes`,
          });

          // add a message collector to thread
          const collector = proofSubThread.createMessageCollector({
            filter: (msg) => !msg.author.bot,
            time: 60_000 * 2,
          });

          collector.on("collect", async (msg) => {
            try {
              if (msg.author.id !== btnInt.user.id) {
                await proofSubThread.send({
                  content:
                    "❌ you do not have permission to perform this action.",
                });
                return;
              }

              if (msg.content.length > 0) {
                await proofSubThread.send(
                  "Please send image for submission only."
                );
                return;
              }

              // get attachment
              const attachments = Array.from(msg.attachments.entries()).map(
                ([_, attachment]) => attachment
              );

              // check for invalid submissions
              if (
                attachments.length > 1 ||
                attachments.some(
                  (attachment) =>
                    attachment.contentType &&
                    !attachment.contentType.startsWith("image/")
                )
              ) {
                await proofSubThread.send("❌ Invalid submission.");
                return;
              }

              await proofSubThread.send({
                content: "Please wait while we process your submission.",
              });

              const proofImage = new AttachmentBuilder(
                attachments[0].url
              ).setName("proof_image.png");

              const updateOpt = {
                $set: {
                  status: "rewarded",
                  rewardedAt: Date.now(),
                  reviewedBy: btnInt.user.id,
                },
              };

              let updatedDoc;
              // update the maze or gquest
              if (type === "gquest")
                updatedDoc = await GQuest.findOneAndUpdate(
                  { messageID: message.id },
                  updateOpt
                );
              else
                updatedDoc = await Maze.findOneAndUpdate(
                  { messageID: message.id },
                  updateOpt
                );

              if (!updatedDoc) return;

              // update user
              const userUpdateOpt =
                type === "gquest"
                  ? {
                      $pull: { "gquests.pending": updatedDoc._id },
                      $push: { "gquests.rewarded": updatedDoc._id },
                      $set: { "gquests.lastRewardedAt": new Date() },
                      $inc: {
                        "gquests.totalRewarded":
                          gquestMazeConfig.gquestRewardAmount,
                      },
                    }
                  : {
                      $pull: { "mazes.pending": updatedDoc._id },
                      $push: { "mazes.rewarded": updatedDoc._id },
                      $set: { "mazes.lastRewardedAt": new Date() },
                      $inc: {
                        "mazes.totalRewarded":
                          (gquestMazeConfig.mazeRewardAmount *
                            ((updatedDoc as IMaze).endFloor -
                              (updatedDoc as IMaze).startFloor)) /
                          100,
                      },
                    };

              const updatedUser = await User.findOneAndUpdate(
                { userID: gquestMazeData.userID },
                userUpdateOpt,
                { new: true }
              );

              if (!updatedUser) return;

              // send a reward message to the associated channel
              const rewardEmbed = new EmbedBuilder()
                .setTitle(
                  `💵 ${
                    type.split("")[0].toUpperCase() + type.slice(1)
                  } Rewarded`
                )
                .setColor("Aqua")
                .setThumbnail("attachment://thumbnail.png")
                .addFields(
                  {
                    name: "\u200b",
                    value: `**📤 Submitted by : **<@${updatedDoc.userID}>`,
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
                    value: `**Total Pending : **${
                      type === "gquest"
                        ? updatedUser.gquests.pending.length
                        : updatedUser.mazes.pending.length
                    }\n**Total Rewarded : **${
                      type === "gquest"
                        ? updatedUser.gquests.rewarded.length
                        : updatedUser.mazes.rewarded.length
                    }`,
                    inline: false,
                  },
                  {
                    name: "\u200b",
                    value: `**🪪 ${
                      type.split("")[0].toUpperCase() + type.slice(1)
                    } ID : **\`${updatedDoc.messageID}\``,
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

              // update gquest / maze model
              updatedDoc.rewardMessageID = rewardMessage.id;
              updatedDoc.proofImageUrl = attachments[0].url;
              await updatedDoc.save();

              // edit the previous submission message, remove buttons add a link to new reward message
              const messageLink = `https://discord.com/channels/${guild.id}/${channel.id}/${rewardMessage.id}`;

              const LinkButton =
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                  new ButtonBuilder()
                    .setLabel("Jump to reward message")
                    .setURL(messageLink)
                    .setStyle(ButtonStyle.Link)
                );

              await message.edit({
                components: [LinkButton],
              });

              // send notif to user and delete thread at last
              const sendNotif =
                type === "gquest"
                  ? updatedUser.gquests.dmNotif
                  : updatedUser.mazes.dmNotif;

              // send at dm
              if (sendNotif) {
                try {
                  const targetUser = await client.users.fetch(
                    updatedDoc.userID
                  );

                  await targetUser.send({
                    embeds: [rewardEmbed],
                    files: [proofImage, thumbnail],
                  });
                } catch (err) {
                  console.warn("Cannot send DM to user");
                }
              }

              await proofSubThread.delete();
            } catch (err) {
              console.error("Error in reward collector inside thread : ", err);
            }
          });

          collector.on("end", async (collected, reason) => {
            try {
              if (reason === "time" && collected.size === 0) {
                await btnInt.editReply(
                  "Interaction time out. Please try submitting again."
                );
              }
            } catch (err) {
              console.error(
                "Error in proof image collector thread end event : ",
                err
              );
            } finally {
              try {
                await proofSubThread.delete();
              } catch (err) {
                if (err instanceof DiscordAPIError && err.code === 10003) {
                  console.log("Thread was already deleted.");
                } else {
                  console.error("Error deleting thread in finally block:", err);
                }
              }
            }
          });
        }

        if (btnInt.customId === "reject") {
          // display a modal to user
          const modal = new ModalBuilder()
            .setCustomId(`${type}_rejection_modal_${gquestMazeData.messageID}`)
            .setTitle(`Guild ${type == "gquest" ? "Quest" : "Maze"} Rejection`);

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
        console.error("Error in gquest/maze collector collect event : ", err);
      }
    });
  } catch (err) {
    console.error("Error in gquest/maze collector function : ", err);
  }
};

export const getContributionScore = (rewarded: number, rejected: number) => {
  return rewarded * 10 - rejected * 3;
};

const selectMenuOptions = [
  { label: "Guild Quests", value: "guild_quest" },
  { label: "Guild Maze", value: "maze" },
];

export const generateGquestsListEmbed = async (
  interaction: ChatInputCommandInteraction,
  gquestMazeArr: IGquest[] | IMaze[],
  title: string,
  type: string
) => {
  try {
    const guild = interaction.guild;

    if (!guild) return;

    let page = 0;
    const pageSize = 5;
    const totalPages = Math.ceil(gquestMazeArr.length / pageSize);

    const getEmbed = (page: number, pageSize: number) => {
      const startIndex = page * pageSize;
      const endIndex = pageSize + startIndex;

      const slicedArr = gquestMazeArr.slice(startIndex, endIndex);

      const embed = new EmbedBuilder()
        .setTitle(`${title}`)
        .setThumbnail("attachment://thumbnail.png")
        .setColor("Gold")
        .setDescription(
          slicedArr
            .map((ele, idx) => {
              const submittedLine = `\n\n**${startIndex + idx + 1}. [${
                type === "guild_quest" ? "Gquest" : "Maze"
              } ID: \`${ele.messageID}\`]\n**
**👤 Submitted by: **<@${ele.userID}>
** Submitted on: **<t:${Math.ceil(ele.submittedAt! / 1000)}:F>`;

              const rewardedLine =
                type === "rewarded"
                  ? `** Rewarded by: **<@${ele.reviewedBy}>
** Rewarded on: **<t:${Math.ceil(ele.rewardedAt! / 1000)}:F>`
                  : "";

              const rejectedLine =
                type === "rejected"
                  ? `** Rejected by: **<@${ele.reviewedBy}>
** Rejected on: **<t:${Math.ceil(ele.rejectedAt! / 1000)}:F>
** Reason: **_${ele.rejectionReason!}_`
                  : "";

              return [submittedLine, rewardedLine, rejectedLine]
                .filter(Boolean)
                .join("\n");
            })
            .join("\n\n────────────\n\n")
        )
        .setFooter({
          text: `${guild.name} • Guild ${
            type === "guild_quest" ? "Quests" : "Mazes"
          }`,
        })
        .setTimestamp();

      return embed;
    };

    const initialEmbed = getEmbed(page, pageSize);

    const buttonsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`${type}_prev`)
        .setEmoji("⬅️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page <= 0),
      new ButtonBuilder()
        .setCustomId(`${type}_next`)
        .setEmoji("➡️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page >= totalPages - 1)
    );

    await interaction.editReply({
      embeds: [initialEmbed],
      components: [buttonsRow],
      files: [thumbnail],
    });
    const reply = await interaction.fetchReply();

    const collector = reply.createMessageComponentCollector({
      time: 60_000 * 10, //10 minutes
      filter: (i) =>
        [`${type}_prev`, `${type}_next`].includes(i.customId) &&
        i.user.id === interaction.user.id,
    });

    collector.on("collect", async (btnInt) => {
      try {
        await btnInt.deferUpdate();

        if (btnInt.customId === `${type}_prev`) page--;
        if (btnInt.customId === `${type}_next`) page++;

        buttonsRow.components[0].setDisabled(page <= 0);
        buttonsRow.components[1].setDisabled(page >= totalPages - 1);

        const newEmbed = getEmbed(page, pageSize);

        await interaction.editReply({
          embeds: [newEmbed],
          components: [buttonsRow],
        });
      } catch (err) {
        console.error("Error in collector :", err);
      }
    });

    collector.on("end", async (collected, reason) => {
      try {
        if (reason === "time") {
          await interaction.editReply({
            content: "⏱️ Interaction timed out.",
            components: [],
          });
        }
      } catch (err) {
        console.error(err);
      }
    });
  } catch (err) {
    console.error("Error generating gquests list embed : ", err);
  }
};

// give paginated leaderboard
export const getGquestMazeLeaderboard = async (
  client: Client,
  users: IUser[],
  guild: Guild,
  type: string,
  interaction: ChatInputCommandInteraction
) => {
  try {
    let page = 0;
    const pageSize = 10;
    const totalPages = Math.ceil(users.length / pageSize);

    // function that sorts and slices
    const getUsers = (
      page: number,
      type: string
    ): questMazeLeaderboardUser[] => {
      const startIndex = page * pageSize;
      const endIndex = pageSize + startIndex;

      // sort based on type
      const sortedUsers = [...users].sort((a, b) => {
        const compParameter = (user: IUser) => {
          const rewarded =
            type === "guild_quest"
              ? user.gquests.rewarded
              : user.mazes.rewarded;
          const rejected =
            type === "guild_quest"
              ? user.gquests.rejected
              : user.mazes.rejected;

          return (
            rewarded.length +
            getContributionScore(rewarded.length, rejected.length)
          );
        };

        return compParameter(b) - compParameter(a);
      });

      return sortedUsers.slice(startIndex, endIndex).map((user, idx) => {
        const rewarded =
          type === "guild_quest" ? user.gquests.rewarded : user.mazes.rewarded;
        const rejected =
          type === "guild_quest" ? user.gquests.rejected : user.mazes.rejected;

        return {
          userID: user.userID,
          rank: startIndex + idx + 1,
          completed: rewarded.length,
          contribution_score: getContributionScore(
            rewarded.length,
            rejected.length
          ),
        };
      });
    };

    const usersArr = getUsers(page, type);

    const leaderboardImage = await generateGquestMazeLeaderboardImage(
      client,
      usersArr
    );

    const embed = new EmbedBuilder()
      .setTitle(
        `📊 ${guild.name} ${type
          .split("_")
          .map((word) => word.at(0)!.toUpperCase() + word.slice(1))
          .join(" ")} Leaderboard`
      )
      .setColor("Aqua")
      .setFooter({ text: `${guild.name} ${type}` })
      .setImage("attachment://leaderboard.png")
      .setTimestamp();

    const buttonsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`leaderboard_prev`)
        .setEmoji("⬅️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page <= 0),
      new ButtonBuilder()
        .setCustomId(`leaderboard_next`)
        .setEmoji("➡️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page >= totalPages - 1)
    );

    const selectMenuRow =
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("leaderboard_select")
          .addOptions(
            selectMenuOptions.map((option) => {
              return new StringSelectMenuOptionBuilder()
                .setLabel(option.label)
                .setValue(option.value)
                .setDefault(type === option.value);
            })
          )
      );

    await interaction.editReply({
      embeds: [embed],
      files: [leaderboardImage],
      components: [buttonsRow, selectMenuRow],
    });

    // add collector
    const reply = await interaction.fetchReply();

    const collector = reply.createMessageComponentCollector({
      time: 60_000 * 10,
      filter: (i) =>
        ["leaderboard_prev", "leaderboard_select", "leaderboard_next"].includes(
          i.customId
        ) && i.user.id === interaction.user.id,
    });

    collector.on("collect", async (compInt) => {
      try {
        // if button interaction
        if (compInt.isButton()) {
          await compInt.deferUpdate();
          if (compInt.customId === "leaderboard_prev") page--;
          if (compInt.customId === "leaderboard_next") page++;

          buttonsRow.components[0].setDisabled(page <= 0);
          buttonsRow.components[1].setDisabled(page >= totalPages - 1);

          const newUsers = getUsers(page, type);
          // generate new image
          const newLeaderboardImage = await generateGquestMazeLeaderboardImage(
            client,
            newUsers
          );

          embed.setTitle(
            `📊 ${guild.name} ${type
              .split("_")
              .map((word) => word.at(0)!.toUpperCase() + word.slice(1))
              .join(" ")} Leaderboard`
          );

          await interaction.editReply({
            embeds: [embed],
            components: [buttonsRow, selectMenuRow],
            files: [newLeaderboardImage],
          });
        }

        // if select menu interaction
        if (compInt.isStringSelectMenu()) {
          await compInt.deferUpdate();
          page = 0;
          type = compInt.values[0];

          const newUsers = getUsers(page, type);
          const leaderboardImage = await generateGquestMazeLeaderboardImage(
            client,
            newUsers
          );

          embed.setTitle(
            `📊 ${guild.name} ${type
              .split("_")
              .map((word) => word.at(0)!.toUpperCase() + word.slice(1))
              .join(" ")} Leaderboard`
          );

          const newSelectMenuRow =
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
              new StringSelectMenuBuilder()
                .setCustomId("leaderboard_select")
                .addOptions(
                  selectMenuOptions.map((option) => {
                    return new StringSelectMenuOptionBuilder()
                      .setLabel(option.label)
                      .setValue(option.value)
                      .setDefault(type === option.value);
                  })
                )
            );

          await interaction.editReply({
            embeds: [embed],
            components: [buttonsRow, newSelectMenuRow],
            files: [leaderboardImage],
          });
        }
      } catch (err) {
        console.error(
          "Error in guild quest/maze leaderboard collector : ",
          err
        );
      }
    });

    collector.on("end", async (collected, reason) => {
      try {
        if (reason === "time") {
          await interaction.editReply({
            content: "⏱️ Interaction timed out.",
            components: [],
          });
          return;
        }
      } catch (err) {
        console.error(err);
      }
    });
  } catch (err) {
    console.error("Error generating guild quest or maze leaderboard : ", err);
  }
};
