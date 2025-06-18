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
  ComponentType,
  EmbedBuilder,
  MessageActionRowComponentBuilder,
} from "discord.js";
import { IRaid } from "./interfaces";
import Config from "../models/configSchema";
import Raid from "../models/raidSchema";
import { leaderboardThumbnail } from "../data/helperArrays";
import User from "../models/userSchema";

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
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("raid_remove")
        .setEmoji("❌")
        .setStyle(ButtonStyle.Secondary)
    );

    await announceMsg.edit({ components: [buttonRow] });

    const collector = announceMsg.createMessageComponentCollector({
      time: raid.raidTimestamps.finishTime! - Date.now(),
      filter: (i) =>
        ["raid_tank", "raid_support", "raid_dps", "raid_remove"].includes(
          i.customId
        ),
    });

    let tanks: string[] = [],
      dps: string[] = [],
      supports: string[] = [],
      waitlist_tanks: string[] = [],
      waitlist_supports: string[] = [],
      waitlist_dps: string[] = [];

    const banner = new AttachmentBuilder(raid.bannerUrl).setName("raid.png");

    collector.on("collect", async (btnInt) => {
      try {
        // check if this is a valid interaction
        // each user participating must have the required role
        await btnInt.deferReply({ flags: "Ephemeral" });

        if (!guild) {
          await btnInt.editReply({ content: "No guild found." });
          return;
        }

        const guild_member = await guild.members.fetch({
          user: btnInt.user.id,
          force: true,
        });
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
          if (totalRegistered < 16) {
            supports = supports.filter((member) => member !== user.id);
            dps = dps.filter((member) => member !== user.id);

            if (!tanks.includes(user.id)) tanks.push(user.id);
          } else {
            waitlist_supports = waitlist_supports.filter(
              (member) => member !== user.id
            );
            waitlist_dps = waitlist_dps.filter((member) => member !== user.id);

            if (!waitlist_tanks.includes(user.id)) waitlist_tanks.push(user.id);
          }

          await btnInt.editReply({
            content:
              totalRegistered < 16
                ? "You registered as a tank for next raid."
                : "Raid is full! You’ve been added to the waitlist.",
          });
        }

        if (btnInt.customId === "raid_dps") {
          if (totalRegistered < 16) {
            tanks = tanks.filter((member) => member !== user.id);
            supports = supports.filter((member) => member !== user.id);

            if (!dps.includes(user.id)) dps.push(user.id);
          } else {
            waitlist_tanks = waitlist_tanks.filter(
              (member) => member !== user.id
            );
            waitlist_supports = waitlist_supports.filter(
              (member) => member !== user.id
            );

            if (!waitlist_dps.includes(user.id)) waitlist_dps.push(user.id);
          }

          await btnInt.editReply({
            content:
              totalRegistered < 16
                ? "You registered as a dps for next raid."
                : "Raid is full! You’ve been added to the waitlist.",
          });
        }

        if (btnInt.customId === "raid_support") {
          if (totalRegistered < 16) {
            dps = dps.filter((member) => member !== user.id);
            tanks = tanks.filter((member) => member !== user.id);

            if (!supports.includes(user.id)) supports.push(user.id);
          } else {
            waitlist_dps = waitlist_dps.filter((member) => member !== user.id);
            waitlist_tanks = waitlist_tanks.filter(
              (member) => member !== user.id
            );

            if (!waitlist_supports.includes(user.id))
              waitlist_supports.push(user.id);
          }

          await btnInt.editReply({
            content:
              totalRegistered < 16
                ? "You registered as a support for next raid."
                : "Raid is full! You’ve been added to the waitlist.",
          });
        }

        if (btnInt.customId === "raid_remove") {
          tanks = tanks.filter((member) => member !== user.id);
          supports = supports.filter((member) => member !== user.id);
          dps = dps.filter((member) => member !== user.id);
          waitlist_tanks = waitlist_tanks.filter(
            (member) => member !== user.id
          );
          waitlist_supports = waitlist_supports.filter(
            (member) => member !== user.id
          );
          waitlist_dps = waitlist_dps.filter((member) => member !== user.id);

          await btnInt.editReply({
            content: "You are not a part of this raid anymore.",
          });
        }

        // update schema
        await Raid.findOneAndUpdate(
          {
            announcementMessageID: announceMsg.id,
            serverID: raid.serverID,
          },
          {
            $set: {
              "participants.tank": tanks,
              "participants.support": supports,
              "participants.dps": dps,
              "waitlist.tank": waitlist_tanks,
              "waitlist.support": waitlist_supports,
              "waitlist.dps": waitlist_dps,
            },
          }
        );

        const waitlisted = [
          ...waitlist_dps,
          ...waitlist_supports,
          ...waitlist_tanks,
        ];

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
          ])
          .setThumbnail("attachment://thumbnail.png")
          .setImage("attachment://raid.png");

        if (waitlisted.length > 0) {
          newEmbed.addFields({
            name: "\u200b",
            value: `${waitlisted.map((user) => `<@${user}>`).join("\n")}`,
            inline: false,
          });
        }

        newEmbed.addFields({
          name: "\u200b",
          value: `**Total Participants : **${
            tanks.length + supports.length + dps.length + waitlisted.length
          }`,
          inline: false,
        });

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
                  .join(" ")}** - ${bossElements[bosses.indexOf(boss)]}`
            )
            .join("\n")}\n` +
          `**Scheduled Time:** <t:${Math.floor(
            raid.raidTimestamps.startTime! / 1000
          )}:F> (<t:${Math.floor(
            raid.raidTimestamps.startTime! / 1000
          )}:R>)\n\n` +
          `Use \`/raid scout <raid_id>\` on designated guild channel`
      )
      .addFields({
        name: "\u200b",
        value: `**🪪 Raid ID ** : \`${raid.announcementMessageID}\``,
        inline: false,
      })
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
                  .join(" ")}** - ${bossElements[bosses.indexOf(boss)]}`
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

      const userDb = await User.findOne({ userID: participant });

      if (userDb && userDb.raids.dmNotif)
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
      .addFields({
        name: "\u200b",
        value: `**🪪 Raid ID ** : \`${raid.announcementMessageID}\``,
        inline: false,
      })
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

    const allocationMsg = await channel.send({
      embeds: [embed],
      files: [thumbnail],
    });

    // also change the original message of announcement, remove components and add link button to
    // allocation message
    // find the message
    const announceMsg = await channel.messages.fetch(
      raid.announcementMessageID
    );

    const link = `https://discord.com/channels/${guild.id}/${channel.id}/${allocationMsg.id}`;

    const linkButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("Jumpt to team allocation")
        .setStyle(ButtonStyle.Link)
        .setURL(link)
    );

    // only get the link button
    const allActionRows = announceMsg.components.map((row) =>
      ActionRowBuilder.from(row as any)
    ) as ActionRowBuilder<MessageActionRowComponentBuilder>[];

    // filter them now
    const persistComponents = allActionRows
      .map((row) => {
        const filteredButtons = row.components.filter(
          (component): component is ButtonBuilder => {
            return (
              component instanceof ButtonBuilder &&
              component.data.style === ButtonStyle.Link
            );
          }
        );

        if (!filteredButtons.length) return null;

        return new ActionRowBuilder<ButtonBuilder>().addComponents(
          filteredButtons
        );
      })
      .filter((row): row is ActionRowBuilder<ButtonBuilder> => row !== null);

    await announceMsg.edit({ components: [...persistComponents, linkButton] });

    // update schema as well
    await Raid.findOneAndUpdate(
      {
        announcementMessageID: raid.announcementMessageID,
      },
      {
        $set: {
          teamAllotmentMessageID: allocationMsg.id,
          stage: "alloted",
          "raidTimestamps.allotmentTime": Date.now(),
        },
      }
    );
  } catch (err) {
    console.error("Error in allocation and annoucnement function");
  }
};

export const raidReviewReminder = async (client: Client, raid: IRaid) => {
  try {
    const guild = await client.guilds.fetch(raid.serverID);
    const guildConfig = await Config.findOne({ serverID: guild.id });

    if (!guildConfig) return;

    const { raidConfig } = guildConfig;
    const { managerRoles } = raidConfig;

    // get all admins
    const admins = Array.from(guild.members.cache.entries())
      .map(([_, member]) => member)
      .filter((member) => {
        for (const role of managerRoles)
          if (member.roles.cache.get(role)) return true;

        return false;
      })
      .map((member) => member.user);

    const reviewEmbed = new EmbedBuilder()
      .setTitle("📋 Raid Participation Review")
      .setColor("Blue")
      .setThumbnail("attachment://thumbnail.png")
      .setDescription(
        `The raid has concluded. Please take a moment to review attendance and note any discrepancies between sign-ups and actual participation.\n\n` +
          `🔍 **Action Required:**\n` +
          `• Cross-check in-game attendance against the reaction list.\n` +
          `• Mark any absentees who did not provide prior notice.\n` +
          `• Record any substitutions or unexpected participants.\n\n` +
          `Maintaining accurate records ensures smoother coordination and accountability for future events.\n` +
          `Use command \`/raid review <raid_id>\` on the designated guild channel.`
      )
      .addFields({
        name: "\u200b",
        value: `**🪪 Raid ID : ${raid.announcementMessageID}`,
        inline: false,
      })
      .setFooter({ text: "Thank you for your support and cooperation." })
      .setTimestamp();

    for (const admin of admins) {
      await admin.send({ embeds: [reviewEmbed] });
    }
  } catch (err) {
    console.error("Error in raid review reminder function : ", err);
  }
};

export const calculateReliability = (completed: number, noShow: number) => {
  const total = completed + noShow;

  return Math.round((completed / total) * 100);
};
