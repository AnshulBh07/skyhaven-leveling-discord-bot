import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  Guild,
  ModalBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { IGquest, IUser, questMazeLeaderboardUser } from "./interfaces";
import Config from "../models/configSchema";
import User from "../models/userSchema";
import GQuest from "../models/guildQuestsSchema";
import { leaderboardThumbnail } from "../data/helperArrays";
import { generateGquestMazeLeaderboardImage } from "../canvas/generateGquestMazeLeaderboardImage";

const thumbnail = new AttachmentBuilder(leaderboardThumbnail).setName(
  "thumbnail.png"
);

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

        if (!hasRole) {
          await btnInt.editReply({
            content: "You do not have the permission to perform this action.",
          });
          return;
        }

        // manage button click now
        // rejection opens a modal whereas rewarding asks for a screenshot from user
        // rewarding will be handled in message create event
        if (btnInt.customId === "reward") {
          await btnInt.deferReply({ flags: "Ephemeral" });

          await GQuest.findOneAndUpdate(
            { messageID: gquestData.messageID },
            { $set: { lastRewardBtnClickAt: Date.now() } }
          );

          await btnInt.editReply({
            content: `Please send the ingame screenshot of reward trade with user <@${gquestData.userID}>. Please submit it within the next 2 minutes`,
          });
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

export const getContributionScore = (rewarded: number, rejected: number) => {
  return rewarded * 10 - rejected * 3;
};

const selectMenuOptions = [
  { label: "Guild Quests", value: "guild_quest" },
  { label: "Guild Maze", value: "maze" },
];

export const generateGquestsListEmbed = async (
  interaction: ChatInputCommandInteraction,
  gquests: IGquest[],
  title: string,
  type: string
) => {
  try {
    const guild = interaction.guild;

    if (!guild) return;

    let page = 0;
    const pageSize = 5;
    const totalPages = Math.ceil(gquests.length / pageSize);

    const getEmbed = (page: number, pageSize: number) => {
      const startIndex = page * pageSize;
      const endIndex = pageSize + startIndex;

      const slicedArr = gquests.slice(startIndex, endIndex);

      const embed = new EmbedBuilder()
        .setTitle(`${title}`)
        .setThumbnail("attachment://thumbnail.png")
        .setColor("Gold")
        .setDescription(
          slicedArr
            .map((gquest, idx) => {
              const submittedLine = `\n\n**${
                startIndex + idx + 1
              }. [Gquest ID: \`${gquest.messageID}\`]\n**
**👤 Submitted by: **<@${gquest.userID}>
** Submitted on: **<t:${Math.ceil(gquest.submittedAt! / 1000)}:F>`;

              const rewardedLine =
                type === "rewarded"
                  ? `** Rewarded by: **<@${gquest.reviewedBy}>
** Rewarded on: **<t:${Math.ceil(gquest.rewardedAt! / 1000)}:F>`
                  : "";

              const rejectedLine =
                type === "rejected"
                  ? `** Rejected by: **<@${gquest.reviewedBy}>
** Rejected on: **<t:${Math.ceil(gquest.rejectedAt! / 1000)}:F>
** Reason: **_${gquest.rejectionReason!}_`
                  : "";

              return [submittedLine, rewardedLine, rejectedLine]
                .filter(Boolean)
                .join("\n");
            })
            .join("\n\n────────────\n\n")
        )
        .setFooter({ text: `${guild.name} • Guild Quests` })
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
          const rewarded = user.gquests.rewarded;
          const rejected = user.gquests.rejected;

          switch (type) {
            case "guild_quest":
              return (
                rewarded.length +
                getContributionScore(rewarded.length, rejected.length)
              );
            default:
              return (
                rewarded.length +
                getContributionScore(rewarded.length, rejected.length)
              );
          }
        };

        return compParameter(b) - compParameter(a);
      });

      return sortedUsers.slice(startIndex, endIndex).map((user, idx) => {
        const rewarded = user.gquests.rewarded;
        const rejected = user.gquests.rejected;

        return type === "guild_quest"
          ? {
              userID: user.userID,
              rank: startIndex + idx + 1,
              completed: user.gquests.rewarded.length,
              contribution_score: getContributionScore(
                rewarded.length,
                rejected.length
              ),
            }
          : {
              userID: user.userID,
              rank: startIndex + idx + 1,
              completed: user.gquests.rewarded.length,
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
