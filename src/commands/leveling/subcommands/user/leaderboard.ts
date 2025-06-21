import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import {
  ISubcommand,
  IUser,
  LeaderboardUserTileInfo,
} from "../../../../utils/interfaces";
import { leaderboardThumbnail } from "../../../../data/helperArrays";
import { getWeekOfYear } from "../../../../utils/getDateString";
import getAllFiles from "../../../../utils/getAllFiles";
import path from "path";
import { generateLeaderboardCanvas } from "../../../../canvas/genearteLeaderboardCard";
import User from "../../../../models/userSchema";

const leaderboardTypes = [
  {
    label: "Overall XP",
    value: "overall",
    description: "Total XP from all activities",
  },
  {
    label: "Text XP",
    value: "text",
    description: "XP earned by sending messages",
  },
  {
    label: "Voice XP",
    value: "voice",
    description: "XP gained from time spent in voice channels",
  },
  {
    label: "Weekly XP",
    value: "weekly",
    description: "Top users based on weekly activity",
  },
  {
    label: "Monthly XP",
    value: "monthly",
    description: "Top users based on monthly activity",
  },
];

// this command generates initial leaderboard with a button row and a select menu
const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "leaderboard",
        description: "Show top users in the server by level",
        type: ApplicationCommandOptionType.Subcommand,
        options: [],
      },

      callback: async (client, interaction) => {
        try {
          const guild = interaction.guild;
          const channel = interaction.channel;

          if (!guild || !channel || channel.type !== ChannelType.GuildText) {
            await interaction.editReply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
            });
            return;
          }

          // get all users for current guild
          const users = await User.find({ serverID: guild.id });

          // initial states for leaderboard
          let page = 0;
          const pageSize = 10;
          let type = "overall";
          const totalPages = Math.ceil(users.length / pageSize);

          // create a button row
          const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId("level_leaderboard_prev")
              .setEmoji("⬅️")
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(page === 0),
            new ButtonBuilder()
              .setCustomId("level_leaderboard_next")
              .setEmoji("➡️")
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(page === totalPages - 1)
          );

          const thumbnail = new AttachmentBuilder(leaderboardThumbnail).setName(
            "thumbnail.png"
          );

          // create a select menu
          const selectRow =
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
              new StringSelectMenuBuilder()
                .setCustomId("type_menu")
                .setPlaceholder("OverallXP")
                .addOptions(
                  leaderboardTypes.map((option, index) => {
                    const newOption = new StringSelectMenuOptionBuilder()
                      .setLabel(option.label)
                      .setDescription(option.description)
                      .setValue(option.value)
                      .setDefault(type === option.value);

                    return newOption;
                  })
                )
            );

          const generateLeaderboard = (
            usersArr: IUser[],
            pageSize: number,
            page: number,
            type: string
          ): LeaderboardUserTileInfo[] => {
            const now = new Date();
            const currWeek = getWeekOfYear(now);
            const currMonth = now.getMonth();
            const currYear = now.getFullYear();

            const getXpForPeriod = (
              xpPerDay: Map<string, number>,
              period: "weekly" | "monthly"
            ) => {
              return Array.from(xpPerDay.entries()).reduce(
                (sum, [dateStr, xp]) => {
                  const date = new Date(dateStr);
                  if (period === "weekly")
                    return getWeekOfYear(date) === currWeek &&
                      date.getFullYear() === currYear
                      ? sum + xp
                      : sum;
                  if (period === "monthly")
                    return date.getMonth() === currMonth &&
                      date.getFullYear() === currYear
                      ? sum + xp
                      : sum;
                  return sum;
                },
                0
              );
            };

            const sortedUsers = [...usersArr].sort((a, b) => {
              const getXp = (user: IUser) => {
                switch (type) {
                  case "overall":
                    return user.leveling.totalXp || 0;
                  case "text":
                    return user.leveling.textXp || 0;
                  case "voice":
                    return user.leveling.voiceXp || 0;
                  case "weekly":
                    return getXpForPeriod(user.leveling.xpPerDay, "weekly");
                  case "monthly":
                    return getXpForPeriod(user.leveling.xpPerDay, "monthly");
                  default:
                    return user.leveling.totalXp || 0;
                }
              };
              return getXp(b) - getXp(a); // Descending
            });

            const startIndex = page * pageSize;
            const endIndex = startIndex + pageSize;

            const leaderboardList = sortedUsers
              .slice(startIndex, endIndex)
              .map((user, idx) => {
                const displayedXp = (() => {
                  switch (type) {
                    case "overall":
                      return user.leveling.totalXp || 0;
                    case "text":
                      return user.leveling.textXp || 0;
                    case "voice":
                      return user.leveling.voiceXp || 0;
                    case "weekly":
                      return getXpForPeriod(user.leveling.xpPerDay, "weekly");
                    case "monthly":
                      return getXpForPeriod(user.leveling.xpPerDay, "monthly");
                    default:
                      return user.leveling.totalXp || 0;
                  }
                })();

                const userInfo: LeaderboardUserTileInfo = {
                  userID: user.userID,
                  level: user.leveling.level,
                  rank: startIndex + idx + 1,
                  xp: displayedXp,
                  currentRole: user.leveling.currentRole,
                };

                return userInfo;
              });

            return leaderboardList;
          };

          let leaderboardList = generateLeaderboard(
            users,
            pageSize,
            page,
            type
          );

          // first we will get a random image out of all the images meant for bg
          const allImages = getAllFiles(
            path.join(__dirname, "../../..", "assets/images/leaderboard_bg"),
            false
          );

          const randomBg =
            allImages[Math.floor(Math.random() * allImages.length)];

          // get all roles for the guild
          const roles = Array.from(guild.roles.cache).map(([_, role]) => role);

          const leaderboardCard = await generateLeaderboardCanvas(
            client,
            leaderboardList,
            type,
            randomBg,
            roles
          );

          // the message to attach components with
          const leaderboardEmbed = new EmbedBuilder()
            .setTitle("🏆 LEADERBOARD")
            .setDescription(
              "Here's the current ranking based on overall XP. Use select menu to change views."
            )
            .setColor("Gold")
            .setThumbnail("attachment://thumbnail.png");

          if (leaderboardCard) leaderboardEmbed.setImage("attachment://bg.png");

          await interaction.deleteReply();

          const reply = await channel.send({
            embeds: [leaderboardEmbed],
            components: [buttonRow, selectRow],
            files: [thumbnail, ...(leaderboardCard ? [leaderboardCard] : [])],
          });

          // now create a collector to enable interaction
          const collector = reply.createMessageComponentCollector({
            time: 60_000 * 100,
            filter: (i) =>
              i.user.id === interaction.user.id &&
              [
                "level_leaderboard_prev",
                "level_leaderboard_next",
                "type_menu",
              ].includes(i.customId) &&
              !i.user.bot,
          });

          collector.on("collect", async (compInt) => {
            try {
              // if button interaction
              if (compInt.isButton()) {
                await compInt.deferUpdate();

                if (compInt.customId === "prev") page--;
                if (compInt.customId === "next") page++;

                buttonRow.components[0].setDisabled(page <= 0);
                buttonRow.components[1].setDisabled(page >= totalPages - 1);

                const leaderboardList = generateLeaderboard(
                  users,
                  pageSize,
                  page,
                  type
                );

                // generate new embed
                const newCard = await generateLeaderboardCanvas(
                  client,
                  leaderboardList,
                  type,
                  randomBg,
                  roles
                );

                if (newCard) leaderboardEmbed.setImage("attachment://bg.png");

                await reply.edit({
                  embeds: [leaderboardEmbed],
                  components: [buttonRow, selectRow],
                });
              }

              // if select menu interaction
              if (compInt.isStringSelectMenu()) {
                await compInt.deferUpdate();
                type = compInt.values[0];
                page = 0;

                buttonRow.components[0].setDisabled(page <= 0);
                buttonRow.components[1].setDisabled(page >= totalPages - 1);

                const leaderboardList = generateLeaderboard(
                  users,
                  pageSize,
                  page,
                  type
                );

                // generate new embed
                const newCard = await generateLeaderboardCanvas(
                  client,
                  leaderboardList,
                  type,
                  randomBg,
                  roles
                );

                if (newCard) leaderboardEmbed.setImage("attachment://bg.png");

                // new select row to show visual change in select menu const selectRow =
                const newSelectMenu =
                  new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                    new StringSelectMenuBuilder()
                      .setCustomId("type_menu")
                      .setPlaceholder("OverallXP")
                      .addOptions(
                        leaderboardTypes.map((option, index) => {
                          const newOption = new StringSelectMenuOptionBuilder()
                            .setLabel(option.label)
                            .setDescription(option.description)
                            .setValue(option.value)
                            .setDefault(type === option.value);

                          return newOption;
                        })
                      )
                  );

                await reply.edit({
                  embeds: [leaderboardEmbed],
                  components: [buttonRow, newSelectMenu],
                });
              }
            } catch (err) {
              console.error(
                "Error in lvl leaderboard collector on collect event : ",
                err
              );
            }
          });

          collector.on("end", async (collected, reason) => {
            try {
              if (reason === "time" && !collected.size) {
                await reply.edit({
                  content:
                    "⏱️ Time out. No interaction was detected from user.",
                  components: [],
                });
                return;
              }

              await reply.edit({
                content: "🔒 This leaderboard session has expired.",
                components: [],
              });
            } catch (err) {
              console.error(err);
            }
          });
        } catch (err) {
          console.error("Error in lvl leaderboard subcommand callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in lvl leaderboard subcommand callback : ", err);
    return undefined;
  }
};

export default init;
