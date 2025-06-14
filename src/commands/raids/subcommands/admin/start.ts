import {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  EmbedBuilder,
} from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";
import {
  getRandomRaidImage,
  getRelativeDiscordTime,
} from "../../../../utils/raidUtils";
import {
  leaderboardThumbnail,
  raidMessages,
} from "../../../../data/helperArrays";

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

          if (!guild) {
            await interaction.reply({
              content: "No guild found",
              flags: "Ephemeral",
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
          const {
            raidChannelID,
            raidDay,
            raidTime,
            tankEmojiID,
            supportEmojiID,
            dpsEmojiID,
          } = raidConfig;

          const day = interaction.options.getNumber("day") ?? raidDay;
          const time = interaction.options.getString("time") ?? raidTime;

          const relativeTime = getRelativeDiscordTime(day, time); //gives unix epoch in seconds

          const thumbnail = new AttachmentBuilder(leaderboardThumbnail).setName(
            "thumbnail.png"
          );

          const raidMessage = raidMessages[
            Math.floor(Math.random() * raidMessages.length)
          ].replace(
            "<t:RAID_TIMESTAMP: R>",
            `<t:${relativeTime}:F> (<t:${relativeTime}:R>)`
          );

          const bossesMsg = `\n\***Bosses : **\n${selectedBosses.map(
            (boss) =>
              `• ${validBossesMapped.find((b) => b.value === boss)?.name} - ${
                bossElements[validBosses.indexOf(boss)]
              } Element\n`
          )}`;

          const roleMsg = `💬 **Pick your role below**:\n <:_:${dpsEmojiID}> **DPS** – Be the damage. Live fast, crit hard.\n <:_:${tankEmojiID}> **Tank** – Take the hits, flex your aggro.\n <:_:${supportEmojiID}> **Support** – Buff the party, carry the team emotionally.`;

          const raidImage = getRandomRaidImage();

          const raidEmbed = new EmbedBuilder()
            .setTitle(`${guild.name} Guild Raids`)
            .setThumbnail("attachment://thumbnail.png")
            .setColor("DarkRed")
            .setDescription(raidMessage + bossesMsg + roleMsg)
            .setImage("attachment://raid.png")
            .setFooter({
              text: `${guild.name} Raids\n Buffs and debuffs will be announced soon.`,
            })
            .setTimestamp();

          await interaction.editReply({
            embeds: [raidEmbed],
            files: [thumbnail, raidImage],
          });
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
