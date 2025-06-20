import {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  ChannelType,
  EmbedBuilder,
} from "discord.js";
import { IRaid, ISubcommand } from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";
import {
  announceAllocation,
  attachRaidParticipationCollector,
  getRandomRaidImage,
  getRelativeDiscordTime,
  raidRemindParticipants,
  raidReviewReminder,
  sendScoutReminder,
} from "../../../../utils/raidUtils";
import {
  leaderboardThumbnail,
  raidMessages,
} from "../../../../data/helperArrays";
import Raid from "../../../../models/raidSchema";

const validBosses = [
  "roaring_thruma",
  "dark_skull",
  "bison",
  "chimera",
  "celdyte",
];
const bossElements = ["Wind", "Dark", "Water", "Earth", "Fire"];
const validBossesMapped = validBosses.map((boss) => ({
  name: boss.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  value: boss,
}));

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const daysMapped = days.map((day, idx) => ({ name: day, value: idx }));

const bossOptions = Array.from({ length: 5 }).map((_, idx) => ({
  name: `boss_${idx + 1}`,
  description: `Choose boss #${idx + 1}`,
  type: ApplicationCommandOptionType.String as number,
  required: idx === 0, // only first boss is required
  choices: validBossesMapped,
}));

const daysOption = {
  name: "day",
  description: "Day of the week.",
  type: ApplicationCommandOptionType.Number as number,
  required: false,
  choices: daysMapped,
};

const timeOption = {
  name: "time",
  description: "Time of the day. (eg. 20:30, in JST)",
  type: ApplicationCommandOptionType.String as number,
  required: false,
};

// start a new raid
const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "start",
        description: "Start a new guild raid.",
        options: [...bossOptions, daysOption, timeOption],
        type: ApplicationCommandOptionType.Subcommand as number,
      },

      callback: async (client, interaction) => {
        try {
          const guild = interaction.guild;
          const channel = interaction.channel;

          if (!guild || !channel || channel.type !== ChannelType.GuildText) {
            await interaction.reply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
            });
            return;
          }

          // get all bosses
          const selectedBosses = [];

          for (let i = 1; i <= 5; i++) {
            const boss = interaction.options.getString(`boss_${i}`);
            if (boss) selectedBosses.push(boss);
          }

          // handle duplicates
          const duplicates = selectedBosses.filter(
            (boss, idx, arr) => arr.indexOf(boss) !== idx
          );

          if (duplicates.length > 0) {
            await interaction.reply({
              content: `Duplicate boss selection found : ${[
                ...new Set(duplicates),
              ].join(",")}`,
              flags: "Ephemeral",
            });
            return;
          }

          await interaction.deferReply({ flags: "Ephemeral" });

          // send an embed at raid channel for raid
          const guildConfig = await Config.findOne({ serverID: guild.id });

          if (!guildConfig) {
            await interaction.editReply({ content: "No guild config found." });
            return;
          }

          const { raidConfig } = guildConfig;
          const { raidDay, raidTime, tankEmojiID, supportEmojiID, dpsEmojiID } =
            raidConfig;

          const currTime = Date.now();
          // cannot start a new raid if a raid is already scheduled, that is the currtime is smaller than
          // the startime of latest raid
          const raids = await Raid.find({ serverID: guild.id }).sort({
            "raidTimestamps.startTime": -1,
          });

          if (!raids.length) {
            await interaction.editReply({ content: "No raids found." });
            return;
          }

          const latestRaid = raids[0] as IRaid;

          if (
            !latestRaid.raidTimestamps.finishTime &&
            latestRaid.raidTimestamps.startTime > currTime
          ) {
            await interaction.editReply({
              content:
                "Cannot start a new raid when a raid is already scheduled.",
            });
            return;
          }

          const day = interaction.options.getNumber("day") ?? raidDay;
          const time = interaction.options.getString("time") ?? raidTime;

          const relativeTime = getRelativeDiscordTime(day + 1, time); //gives unix epoch in seconds

          // cannot create a raid with time that is less than 3 hours close
          const threshold = 3 * 60 * 60 * 1000; //3 hours
          const startTime = relativeTime * 1000;

          if (startTime - currTime < threshold) {
            await interaction.editReply({
              content:
                "⚠️ Raid start time must be at least 3 hours from now. Please schedule accordingly.",
            });
            return;
          }

          const thumbnail = new AttachmentBuilder(leaderboardThumbnail).setName(
            "thumbnail.png"
          );

          const raidMessage = raidMessages[
            Math.floor(Math.random() * raidMessages.length)
          ].replace(
            /<t:TIMESTAMP:[FR]>/g,
            `<t:${relativeTime}:F> (<t:${relativeTime}:R>)`
          );

          const [raidImage, raidImageUrl] = getRandomRaidImage();

          const raidEmbed = new EmbedBuilder()
            .setTitle(`${guild.name} Guild Raids`)
            .setThumbnail("attachment://thumbnail.png")
            .setColor("DarkRed")
            .addFields(
              { name: "\u200b", value: raidMessage, inline: false },
              {
                name: "\u200b",
                value: `**Bosses : **\n${selectedBosses
                  .map(
                    (boss, idx) =>
                      `${idx + 1}. **${
                        validBossesMapped.find((b) => b.value === boss)?.name
                      }** - ${bossElements[validBosses.indexOf(boss)]} Element`
                  )
                  .join("\n")}`,
                inline: false,
              },
              {
                name: "\u200b",
                value: `\n💬 Pick your role below : `,
                inline: false,
              },
              {
                name: `\n`,
                value: `<:_:${dpsEmojiID}> **DPS** - Be the damage. Live fast, crit hard.`,
                inline: false,
              },
              {
                name: `\n`,
                value: `<:_:${supportEmojiID}> **SUPPORT** - Buff the party, carry the team emotionally.`,
                inline: false,
              },
              {
                name: `\n`,
                value: `<:_:${tankEmojiID}> **TANK** - Take the hits, flex your aggro.`,
                inline: false,
              },
              {
                name: "\u200b",
                value: "Use ❌ to de-register from raid.",
                inline: false,
              }
            )
            .setImage("attachment://raid.png")
            .setFooter({
              text: `${guild.name} Raids\nBuffs and debuffs will be announced soon.`,
            })
            .setTimestamp();

          await interaction.editReply({ content: "Raid process started..." });

          const raidMsg = await channel.send({
            embeds: [raidEmbed],
            files: [thumbnail, raidImage],
          });

          raidEmbed.addFields({
            name: "\u200b",
            value: `**🪪 Raid ID ** : \`${raidMsg.id}\``,
            inline: false,
          });

          await raidMsg.edit({ embeds: [raidEmbed] });

          // update raid schema
          const newRaid = new Raid({
            serverID: guild.id,
            channelID: channel.id,
            announcementMessageID: raidMsg.id,
            bannerUrl: raidImageUrl,
            scoutMessageID: "dummy id",
            teamAllotmentMessageID: "dummy id",
            bosses: selectedBosses,
            participants: { tank: [], dps: [], support: [] },
            waitlist: { tank: [], dps: [], support: [] },
            stage: "announced",
            raidTimestamps: {
              announcementTime: Date.now(),
              startTime: relativeTime * 1000,
            },
          });
          await newRaid.save();

          // attach collector for participation
          await attachRaidParticipationCollector(client, newRaid as IRaid);

          // send scout reminder embed 24 hrs before raid time, take edge case in consideration
          // what if admin creates a raid that is within next few hours (less than 24)
          // if that's the case send scout reminder immediately
          const isWithin24H = startTime - currTime < 24 * 60 * 60 * 1000;

          setTimeout(
            async () => {
              try {
                const freshRaid = await Raid.findOne({
                  announcementMessageID: raidMsg.id,
                  serverID: guild.id,
                });

                if (
                  freshRaid &&
                  (!freshRaid.bossBuffsImageUrl.length ||
                    !freshRaid.bossDebuffsImageUrl.length)
                )
                  await sendScoutReminder(client, freshRaid as IRaid);
              } catch (err) {
                console.error("Error in scout reminder timer : ", err);
              }
            },
            isWithin24H ? 1000 : startTime - 24 * 60 * 60 * 1000 - currTime
          );

          // allocate teams and send a message, do this 1 hr before raid
          setTimeout(async () => {
            try {
              const freshRaid = await Raid.findOne({
                announcementMessageID: raidMsg.id,
                serverID: guild.id,
              });

              if (freshRaid)
                await announceAllocation(client, freshRaid as IRaid);
            } catch (err) {
              console.error("Error in team allocation timer : ", err);
            }
          }, startTime - currTime - 60 * 60 * 1000);

          // send a reminder to all participants 30 minutes before raid
          setTimeout(async () => {
            try {
              const freshRaid = await Raid.findOne({
                announcementMessageID: raidMsg.id,
                serverID: guild.id,
              });

              if (freshRaid)
                await raidRemindParticipants(client, freshRaid as IRaid);
            } catch (err) {
              console.error("Error in raid reminder timer : ", err);
            }
          }, startTime - currTime - 30 * 60 * 1000);

          // timer for sending a review reminder, do this 3 hour after raid
          setTimeout(async () => {
            const freshRaid = await Raid.findOneAndUpdate(
              {
                announcementMessageID: raidMsg.id,
                serverID: guild.id,
              },
              {
                $set: {
                  stage: "finished",
                  "raidTimestamps.finishTime": Date.now(),
                },
              },
              { new: true }
            );

            if (freshRaid && !freshRaid.raidTimestamps.reviewTime)
              await raidReviewReminder(client, freshRaid as IRaid);
          }, startTime - currTime + 3 * 60 * 60 * 1000);
        } catch (err) {
          console.error("Error in raid start subcommand callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in raid strart subcommand : ", err);
    return undefined;
  }
};

export default init;
