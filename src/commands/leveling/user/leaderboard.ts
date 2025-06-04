import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { ICommandObj, IUser } from "../../../utils/interfaces";
import { leaderboardThumbnail, sampleUsers } from "../../../data/helperArrays";
import { getWeekOfYear } from "../../../utils/getDateString";

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
const init = async (): Promise<ICommandObj | undefined> => {
  try {
    return {
      name: "leaderboard",
      description: "Show top users in the server by level",
      options: [],
      permissionsRequired: [PermissionFlagsBits.SendMessages],

      callback: async (client, interaction) => {
        try {
          const guild = interaction.guild;

          if (!guild || !interaction.channel) return;

          // initial states for leaderboard
          let page = 0;
          const pageSize = 10;
          let type = "overall";
          const totalPages = Math.ceil(sampleUsers.length / pageSize);

          // create a button row
          const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId("prev")
              .setEmoji("⬅️")
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(page === 0),
            new ButtonBuilder()
              .setCustomId("next")
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

          // the message to attach components with
          const leaderboardEmbed = new EmbedBuilder()
            .setTitle("🏆 LEADERBOARD")
            .setDescription(
              "Here's the current ranking based on overall XP. Use select menu to change views."
            )
            .setColor("Gold")
            .setThumbnail("attachment://thumbnail.png");

          const generateLeaderboard = (
            usersArr: IUser[],
            pageSize: number,
            page: number,
            type: string
          ) => {
            const valueMap = new Map<string, string>([
              ["overall", "Total XP"],
              ["text", "Text XP"],
              ["voice", "Voice XP"],
              ["weekly", "Weekly XP"],
              ["monthly", "Monthly XP"],
            ]);

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

                return `${startIndex + idx + 1}. ${user.username} -> level:${
                  user.leveling.level
                }, ${valueMap.get(type)}: ${displayedXp}`;
              })
              .join("\n");

            return leaderboardList;
          };

          let leaderboardList = generateLeaderboard(
            sampleUsers,
            pageSize,
            page,
            type
          );

          await interaction.reply({
            content: leaderboardList,
            embeds: [leaderboardEmbed],
            components: [buttonRow, selectRow],
            files: [thumbnail],
          });

          const reply = await interaction.fetchReply();

          // now create a collector to enable interaction
          const collector = reply.createMessageComponentCollector({
            time: 60_000 * 100,
            filter: (i) =>
              i.user.id === interaction.user.id &&
              ["prev", "next", "type_menu"].includes(i.customId),
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

                const leaderboard = generateLeaderboard(
                  sampleUsers,
                  pageSize,
                  page,
                  type
                );

                await interaction.editReply({
                  content: leaderboard,
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

                const leaderboard = generateLeaderboard(
                  sampleUsers,
                  pageSize,
                  page,
                  type
                );

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

                await interaction.editReply({
                  content: leaderboard,
                  components: [buttonRow, newSelectMenu],
                });
              }
            } catch (err) {
              console.error(err);
            }
          });

          collector.on("end", async (collected, reason) => {
            const disabledButtonsRow =
              new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                  .setCustomId("prev_button")
                  .setEmoji("⬅️")
                  .setStyle(ButtonStyle.Secondary)
                  .setDisabled(true),
                new ButtonBuilder()
                  .setCustomId("next_button")
                  .setEmoji("➡️")
                  .setStyle(ButtonStyle.Secondary)
                  .setDisabled(true)
              );

            const disabledSelectMenu =
              new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                new StringSelectMenuBuilder()
                  .setCustomId("type_menu")
                  .setPlaceholder("OverallXP")
                  .addOptions(
                    leaderboardTypes.map((option, index) => {
                      const newOption = new StringSelectMenuOptionBuilder()
                        .setLabel(option.label)
                        .setDescription(option.description)
                        .setValue(option.value);

                      if (index === 0) newOption.setDefault(true);

                      return newOption;
                    })
                  )
                  .setDisabled(true)
              );

            try {
              if (reason === "time" && !collected.size) {
                await interaction.editReply({
                  content:
                    "⏱️ Time out. No interaction was detected from user.",
                  components: [],
                });
                return;
              }

              await interaction.editReply({
                content: "🔒 This leaderboard session has expired.",
                components: [disabledSelectMenu, disabledButtonsRow],
              });
            } catch (err) {
              console.error(err);
            }
          });
        } catch (err) {
          console.error(err);
        }
      },
    };
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

export default init;
