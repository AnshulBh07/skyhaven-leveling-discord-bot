import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import getAllFiles from "./getAllFiles";
import path from "path";
import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Client,
  EmbedBuilder,
} from "discord.js";
import { IRaid } from "./interfaces";
import Config from "../models/configSchema";
import Raid from "../models/raidSchema";
import { leaderboardThumbnail } from "../data/helperArrays";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getRelativeDiscordTime = (day: number, time: string): number => {
  const [hour, minute] = time.split(":").map(Number);

  // Current JST time
  const now = dayjs().tz("Asia/Tokyo");

  // Get next occurrence of specified day
  let target = now.day(day).hour(hour).minute(minute).second(0).millisecond(0);

  // If it's earlier in the week or same day but time already passed, add 7 days
  if (target.isBefore(now)) {
    target = target.add(7, "day");
  }

  const unix = Math.floor(target.unix()); // Discord wants seconds, not ms

  return unix; // Relative time format (e.g. "in 2 days")
};

export const getRandomRaidImage = () => {
  const allImages = getAllFiles(
    path.join(__dirname, "..", "assets/images/raids_ss"),
    false
  );

  const randomImage = allImages[Math.floor(Math.random() * allImages.length)];

  const image = new AttachmentBuilder(randomImage).setName("raid.png");

  return [image, randomImage];
};

const thumbnail = new AttachmentBuilder(leaderboardThumbnail).setName(
  "thumbnail.png"
);

export const attachRaidParticipationCollector = async (
  client: Client,
  raid: IRaid
) => {
  try {
    // fetch the message to attach collector on
    const guild = await client.guilds.fetch(raid.serverID);
    const channel = await guild.channels.fetch(raid.channelID);

    if (!channel || channel.type !== ChannelType.GuildText) return;

    const announceMsg = await channel.messages.fetch(
      raid.announcementMessageID
    );

    const guildConfig = await Config.findOne({ serverID: guild.id });

    if (!guildConfig) return;

    const { raidConfig } = guildConfig;
    const { tankEmojiID, supportEmojiID, dpsEmojiID, raidRole } = raidConfig;

    const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("raid_tank")
        .setEmoji(tankEmojiID)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("raid_dps")
        .setEmoji(dpsEmojiID)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("raid_support")
        .setEmoji(supportEmojiID)
        .setStyle(ButtonStyle.Secondary)
    );

    await announceMsg.edit({ components: [buttonRow] });

    const collector = announceMsg.createMessageComponentCollector({
      time: raid.raidTimestamps.finishTime! - Date.now(),
      filter: (i) =>
        ["raid_tank", "raid_support", "raid_dps"].includes(i.customId),
    });

    let tanks: string[] = [],
      dps: string[] = [],
      supports: string[] = [];

    const banner = new AttachmentBuilder(raid.bannerUrl).setName("raid.png");

    collector.on("collect", async (btnInt) => {
      try {
        // check if this is a valid interaction
        // each user participating must have the required role
        await btnInt.deferReply({ flags: "Ephemeral" });

        const guild = btnInt.guild;

        if (!guild) {
          await btnInt.editReply({ content: "No guild found." });
          return;
        }

        const guild_member = await guild.members.fetch(btnInt.user.id);
        const member_roles = Array.from(guild_member.roles.cache.entries()).map(
          ([_, role]) => role.id
        );

        if (!member_roles.includes(raidRole)) {
          await btnInt.editReply({
            content:
              "User does not have the required role to perform this action.",
          });
          return;
        }

        // update the list of members on message
        const ogEmbed = announceMsg.embeds[0];

        if (!ogEmbed) return;

        const user = btnInt.user;
        const totalRegistered = tanks.length + dps.length + supports.length;

        // now check which button is clicked
        if (btnInt.customId === "raid_tank") {
          totalRegistered < 16
            ? await Raid.findOneAndUpdate(
                {
                  announcementMessageID: announceMsg.id,
                },
                {
                  $addToSet: { "participants.tank": user.id },
                  $pull: {
                    "participants.dps": user.id,
                    "participants.support": user.id,
                  },
                }
              )
            : await Raid.findOneAndUpdate(
                {
                  announcementMessageID: announceMsg.id,
                },
                {
                  $addToSet: { "waitlist.tank": user.id },
                  $pull: {
                    "waitlist.dps": user.id,
                    "waitlist.support": user.id,
                  },
                }
              );

          await btnInt.editReply({
            content:
              totalRegistered < 16
                ? "You registered as a tank for next raid."
                : "Raid is full! You’ve been added to the waitlist.",
          });

          supports = supports.filter((member) => member !== user.id);
          dps = dps.filter((member) => member !== user.id);

          if (!tanks.includes(user.id)) tanks.push(user.id);
        }

        if (btnInt.customId === "raid_dps") {
          totalRegistered < 16
            ? await Raid.findOneAndUpdate(
                {
                  announcementMessageID: announceMsg.id,
                },
                {
                  $addToSet: { "participants.dps": user.id },
                  $pull: {
                    "participants.tank": user.id,
                    "participants.support": user.id,
                  },
                }
              )
            : await Raid.findOneAndUpdate(
                {
                  announcementMessageID: announceMsg.id,
                },
                {
                  $addToSet: { "waitlist.dps": user.id },
                  $pull: {
                    "waitlist.tank": user.id,
                    "waitlist.support": user.id,
                  },
                }
              );

          await btnInt.editReply({
            content:
              totalRegistered < 16
                ? "You registered as a dps for next raid."
                : "Raid is full! You’ve been added to the waitlist.",
          });

          tanks = tanks.filter((member) => member !== user.id);
          supports = supports.filter((member) => member !== user.id);

          if (!dps.includes(user.id)) dps.push(user.id);
        }

        if (btnInt.customId === "raid_support") {
          totalRegistered < 16
            ? await Raid.findOneAndUpdate(
                {
                  announcementMessageID: announceMsg.id,
                },
                {
                  $addToSet: { "participants.support": user.id },
                  $pull: {
                    "participants.dps": user.id,
                    "participants.tank": user.id,
                  },
                }
              )
            : await Raid.findOneAndUpdate(
                {
                  announcementMessageID: announceMsg.id,
                },
                {
                  $addToSet: { "waitlist.support": user.id },
                  $pull: {
                    "waitlist.dps": user.id,
                    "waitlist.tank": user.id,
                  },
                }
              );

          await btnInt.editReply({
            content:
              totalRegistered < 16
                ? "You registered as a dps for next raid."
                : "Raid is full! You’ve been added to the waitlist.",
          });

          dps = dps.filter((member) => member !== user.id);
          tanks = tanks.filter((member) => member !== user.id);

          if (!supports.includes(user.id)) supports.push(user.id);
        }

        const newEmbed = EmbedBuilder.from(ogEmbed);

        const persistFields =
          newEmbed.data.fields?.filter(
            (field) =>
              !["Tanks", "Supports", "DPS"].includes(field.name) &&
              !field.value.includes("Total Participants")
          ) || [];

        newEmbed
          .setFields([
            ...persistFields,
            {
              name: "Tanks",
              value: `${tanks.map((member) => `<@${member}>`).join("\n")}`,
              inline: true,
            },
            {
              name: "DPS",
              value: `${dps.map((member) => `<@${member}>`).join("\n")}`,
              inline: true,
            },
            {
              name: "Supports",
              value: `${supports.map((member) => `<@${member}>`).join("\n")}`,
              inline: true,
            },
            {
              name: "\u200b",
              value: `**Total Participants : **${
                tanks.length + supports.length + dps.length
              }`,
              inline: false,
            },
          ])
          .setThumbnail("attachment://thumbnail.png")
          .setImage("attachment://raid.png");

        await announceMsg.edit({
          embeds: [newEmbed],
          files: [thumbnail, banner],
        });
      } catch (err) {
        console.error("Error in collector on event : ", err);
      }
    });

    collector.on("end", async () => {
      try {
        await announceMsg.edit({
          content: "This raid has already finished.",
          components: [],
        });
      } catch (err) {
        console.error("Error in collector end function : ", err);
      }
    });
  } catch (err) {
    console.error(
      "Error in raid participation collector main function : ",
      err
    );
  }
};

const bosses = ["roaring_thruma", "dark_skull", "bison", "chimera", "celdyte"];
const bossElements = [
  "Wind Element",
  "Dark Element",
  "Water Element",
  "Earth Element",
  "Fire Element",
];

export const sendScoutReminder = async (client: Client, raid: IRaid) => {
  try {
    const guild = await client.guilds.fetch(raid.serverID);

    const guildConfig = await Config.findOne({ serverID: guild.id });

    if (!guildConfig) return;

    const { raidConfig } = guildConfig;
    const { managerRoles } = raidConfig;

    // fetch all users from guild that have any of the managerRoles
    const admins = Array.from(guild.members.cache.entries())
      .filter(([_, member]) => {
        for (const role of managerRoles) {
          if (member.roles.cache.get(role)) return true;
        }
        return false;
      })
      .map(([_, member]) => member.user);

    const reminderEmbed = new EmbedBuilder()
      .setTitle("📣 Raid Scout Reminder")
      .setThumbnail("attachment://thumbnail.png")
      .setDescription(
        `A raid is scheduled and needs to be scouted.\n\n` +
          `**Raid Bosses : **\n ${raid.bosses
            .map(
              (boss, idx) =>
                `${idx + 1}. **${boss
                  .split("_")
                  .map((name) => name.at(0)?.toUpperCase() + name.slice(1))
                  .join(" ")}** - ${bossElements[idx]}`
            )
            .join("\n")}\n` +
          `**Scheduled Time:** <t:${Math.floor(
            raid.raidTimestamps.startTime! / 1000
          )}:F> (<t:${Math.floor(raid.raidTimestamps.startTime! / 1000)}:R>)`
      )
      .setColor("Orange")
      .setFooter({ text: "Please scout and update raid details promptly." })
      .setTimestamp();

    // send this message as DM to all users
    for (const admin of admins) {
      await admin.send({ embeds: [reminderEmbed], files: [thumbnail] });
    }
  } catch (err) {
    console.error("Error in scout reminder function : ", err);
  }
};

export const raidRemindParticipants = async (client: Client, raid: IRaid) => {
  try {
    const guild = await client.guilds.fetch(raid.serverID);

    const allParticipants: string[] = [
      ...raid.participants.tank,
      ...raid.participants.support,
      ...raid.participants.dps,
    ];

    const banner = new AttachmentBuilder(raid.bannerUrl).setName("raid.png");

    const embed = new EmbedBuilder()
      .setTitle("⏰ Raid Reminder!")
      .setDescription(
        `Hey there, adventurer! This is a friendly reminder that a **guild raid** is approaching.\n\n` +
          `Prepare your gear, sharpen your skills, and don't forget to show up!\n\n` +
          `🗓️ **Raid Time : ** <t:${Math.floor(
            raid.raidTimestamps.startTime! / 1000
          )}:F>  (<t:${Math.floor(
            raid.raidTimestamps.startTime! / 1000
          )}:R>)\n` +
          `👾 **Bosses : **\n ${raid.bosses
            .map(
              (boss, idx) =>
                `${idx + 1}. **${boss
                  .split("_")
                  .map((name) => name.at(0)?.toUpperCase() + name.slice(1))
                  .join(" ")}** - ${bossElements[idx]}`
            )
            .join("\n")}\n`
      )
      .setColor("Gold")
      .setFooter({
        text: `${guild.name} Guild • Let’s crush it together!`,
      })
      .setImage("attachment://raid.png")
      .setThumbnail("attachment://thumbnail.png")
      .setTimestamp();

    for (const participant of allParticipants) {
      const user = await client.users.fetch(participant);

      await user.send({ embeds: [embed], files: [thumbnail, banner] });
    }
  } catch (err) {
    console.error("Error in raid reminder function : ", err);
  }
};

type Role = "tank" | "support" | "dps";

interface RoledMember {
  id: string;
  role: Role;
}

type Team = RoledMember[];

interface AllocationResult {
  teams: Team[];
  waitlist: RoledMember[];
}

function allocateRaidTeamsWithRoles(raid: IRaid): AllocationResult {
  // Clone arrays to avoid mutation
  const tanks = [...raid.participants.tank];
  const supports = [...raid.participants.support];
  const dps = [...raid.participants.dps];

  const teams: Team[] = [];
  const used = new Set<string>();

  // 1. Build as many ideal teams as possible (1 tank, 1 support, 2 dps)
  while (
    teams.length < 4 &&
    tanks.length >= 1 &&
    supports.length >= 1 &&
    dps.length >= 2
  ) {
    const team: Team = [
      { id: tanks.shift()!, role: "tank" },
      { id: supports.shift()!, role: "support" },
      { id: dps.shift()!, role: "dps" },
      { id: dps.shift()!, role: "dps" },
    ];
    team.forEach((m) => used.add(m.id));
    teams.push(team);
  }

  // 2. Create a lookup map for role tracking
  const roleMap = new Map<string, Role>();
  for (const id of tanks) roleMap.set(id, "tank");
  for (const id of supports) roleMap.set(id, "support");
  for (const id of dps) roleMap.set(id, "dps");

  // 3. Remaining participants not in ideal teams
  const allParticipants = new Set([
    ...raid.participants.tank,
    ...raid.participants.support,
    ...raid.participants.dps,
  ]);

  const unused = [...allParticipants].filter((id) => !used.has(id));

  // 4. Fill remaining team spots (max 16 players total)
  const maxSpots = 16 - teams.length * 4;
  const fillers = unused.slice(0, maxSpots);

  for (let i = 0; i < fillers.length; i += 4) {
    const team: Team = fillers.slice(i, i + 4).map((id) => ({
      id,
      role: roleMap.get(id) || "dps", // default to dps if unknown
    }));
    team.forEach((m) => used.add(m.id));
    teams.push(team);
  }

  // 5. Waitlist: those beyond the 16-player cap, with their actual role
  const waitlist = unused.slice(fillers.length).map((id) => ({
    id,
    role: roleMap.get(id) || "dps",
  }));

  return { teams, waitlist };
}

export const announceAllocation = async (client: Client, raid: IRaid) => {
  try {
    const guild = await client.guilds.fetch(raid.serverID);

    const guildConfig = await Config.findOne({ serverID: guild.id });

    if (!guildConfig) return;

    const { raidConfig } = guildConfig;
    const { supportEmojiID, tankEmojiID, dpsEmojiID, raidChannelID } =
      raidConfig;

    const channel = await guild.channels.fetch(raidChannelID);

    if (!channel || channel.type !== ChannelType.GuildText) return;

    const rolesEmojiMap = new Map<string, string>([
      ["tank", `<:_:${tankEmojiID}>`],
      ["support", `<:_:${supportEmojiID}>`],
      ["dps", `<:_:${dpsEmojiID}>`],
    ]);

    const { teams, waitlist } = allocateRaidTeamsWithRoles(raid);

    const embed = new EmbedBuilder()
      .setTitle("🛡️ Raid Team Allocation")
      .setColor("Gold")
      .setThumbnail("attachment://thumbnail.png") // Optional thumbnail if you're attaching one
      .setDescription(
        `📢 **Raid team assignments are complete!**\n\n` +
          `Each team consists of up to **4 adventurers**\n\n` +
          `We've prioritized balanced roles wherever possible, but some teams may be more damage-heavy due to class availability.\n\n` +
          `⏳ Players who registered but didn't make the main roster have been placed on the **waitlist** and may be subbed in if needed.\n\n` +
          `Prepare yourselves — the raid begins soon!`
      )
      .setTimestamp();

    // Format each team
    teams.forEach((team, idx) => {
      const members = team
        .map(
          (member) => `${rolesEmojiMap.get(member.role) || ""} <@${member.id}>`
        )
        .join("\n");

      embed.addFields({
        name: `Team ${idx + 1}`,
        value: members,
        inline: false,
      });
    });

    // Waitlist
    if (waitlist.length > 0) {
      const waitlistStr = waitlist
        .map(
          (member) => `${rolesEmojiMap.get(member.role) || ""} <@${member.id}>`
        )
        .join("\n");

      embed.addFields({
        name: "⏳ Waitlist",
        value: waitlistStr,
        inline: false,
      });
    }

    await channel.send({ embeds: [embed], files: [thumbnail] });
  } catch (err) {
    console.error("Error in allocation and annoucnement function");
  }
};
