"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateReliability = exports.raidReviewReminder = exports.announceAllocation = exports.raidRemindParticipants = exports.sendScoutReminder = exports.attachRaidParticipationCollector = exports.getRandomRaidImage = exports.getRelativeDiscordTime = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
const getAllFiles_1 = __importDefault(require("./getAllFiles"));
const path_1 = __importDefault(require("path"));
const discord_js_1 = require("discord.js");
const configSchema_1 = __importDefault(require("../models/configSchema"));
const raidSchema_1 = __importDefault(require("../models/raidSchema"));
const helperArrays_1 = require("../data/helperArrays");
const userSchema_1 = __importDefault(require("../models/userSchema"));
const permissionsCheck_1 = require("./permissionsCheck");
const fetchEmojis_1 = require("./fetchEmojis");
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
const getRelativeDiscordTime = (day, time) => {
    const [hour, minute] = time.split(":").map(Number);
    // Current JST time
    const now = (0, dayjs_1.default)().tz("Asia/Tokyo");
    // Get next occurrence of specified day
    let target = now.day(day).hour(hour).minute(minute).second(0).millisecond(0);
    // If it's earlier in the week or same day but time already passed, add 7 days
    if (target.isBefore(now)) {
        target = target.add(7, "day");
    }
    const unix = Math.floor(target.unix()); // Discord wants seconds, not ms
    return unix; // Relative time format (e.g. "in 2 days")
};
exports.getRelativeDiscordTime = getRelativeDiscordTime;
const getRandomRaidImage = () => {
    const allImages = (0, getAllFiles_1.default)(path_1.default.join(__dirname, "..", "assets/images/raids_ss"), false);
    const randomImage = allImages[Math.floor(Math.random() * allImages.length)];
    const image = new discord_js_1.AttachmentBuilder(randomImage).setName("raid.png");
    return [image, randomImage];
};
exports.getRandomRaidImage = getRandomRaidImage;
const thumbnail = new discord_js_1.AttachmentBuilder(helperArrays_1.leaderboardThumbnail).setName("thumbnail.png");
const attachRaidParticipationCollector = (client, raid) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // fetch the message to attach collector on
        const guild = yield client.guilds.fetch(raid.serverID);
        const channel = yield guild.channels.fetch(raid.channelID, { force: true });
        if (!channel || channel.type !== discord_js_1.ChannelType.GuildText)
            return;
        const announceMsg = yield channel.messages.fetch({
            message: raid.announcementMessageID,
            force: true,
        });
        const guildConfig = yield configSchema_1.default.findOne({ serverID: guild.id });
        if (!guildConfig)
            return;
        const { raidConfig } = guildConfig;
        const { tankEmojiID, supportEmojiID, dpsEmojiID, participantRole } = raidConfig;
        const tankEmoji = (0, fetchEmojis_1.fetchEmojis)(client, tankEmojiID);
        const dpsEmoji = (0, fetchEmojis_1.fetchEmojis)(client, dpsEmojiID);
        const supportEmoji = (0, fetchEmojis_1.fetchEmojis)(client, supportEmojiID);
        const buttonRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId("raid_tank")
            .setEmoji(tankEmoji)
            .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
            .setCustomId("raid_dps")
            .setEmoji(dpsEmoji)
            .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
            .setCustomId("raid_support")
            .setEmoji(supportEmoji)
            .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
            .setCustomId("raid_remove")
            .setEmoji("❌")
            .setStyle(discord_js_1.ButtonStyle.Secondary));
        yield announceMsg.edit({ components: [buttonRow] });
        const collector = announceMsg.createMessageComponentCollector({
            time: 0,
            filter: (i) => ["raid_tank", "raid_support", "raid_dps", "raid_remove"].includes(i.customId),
        });
        const banner = new discord_js_1.AttachmentBuilder(raid.bannerUrl).setName("raid.png");
        // helper functions to add participant role and remove it
        const addParticipantRole = (userID) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const member = yield guild.members.fetch({ user: userID, force: true });
                const role = yield guild.roles.fetch(participantRole, { force: true });
                if (!member || !role)
                    return;
                // if the user doesn't have the role already
                if (!member.roles.cache.has(role.id))
                    yield member.roles.add(role);
            }
            catch (err) {
                console.error("Cannot add joiner role : ", err);
            }
        });
        const removeParticipantRole = (userID) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const member = yield guild.members.fetch({ user: userID, force: true });
                const role = yield guild.roles.fetch(participantRole, { force: true });
                if (!member || !role)
                    return;
                // if user has the role
                if (member.roles.cache.has(role.id))
                    yield member.roles.remove(role);
            }
            catch (err) {
                console.error("Cannot remove joiner role : ", err);
            }
        });
        collector.on("collect", (btnInt) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            try {
                // check if this is a valid interaction
                // each user participating must have the required role
                yield btnInt.deferReply({ flags: "Ephemeral" });
                if (!(yield (0, permissionsCheck_1.isUser)(client, btnInt.user.id, guild.id, "raid"))) {
                    yield btnInt.editReply({
                        content: "You do not have the required role to perform this action.",
                    });
                    return;
                }
                const freshRaid = yield raidSchema_1.default.findOne({
                    announcementMessageID: announceMsg.id,
                    serverID: raid.serverID,
                });
                if (!freshRaid)
                    return;
                let tanks = [...freshRaid.participants.tank], dps = [...freshRaid.participants.dps], supports = [...freshRaid.participants.support], waitlist_tanks = [...freshRaid.waitlist.tank], waitlist_supports = [...freshRaid.waitlist.support], waitlist_dps = [...freshRaid.waitlist.dps];
                // update the list of members on message
                const ogEmbed = announceMsg.embeds[0];
                if (!ogEmbed)
                    return;
                const user = btnInt.user;
                const totalRegistered = tanks.length + dps.length + supports.length;
                // now check which button is clicked
                if (btnInt.customId === "raid_tank") {
                    if (totalRegistered < 16) {
                        supports = supports.filter((member) => member !== user.id);
                        dps = dps.filter((member) => member !== user.id);
                        if (!tanks.includes(user.id))
                            tanks.push(user.id);
                    }
                    else {
                        waitlist_supports = waitlist_supports.filter((member) => member !== user.id);
                        waitlist_dps = waitlist_dps.filter((member) => member !== user.id);
                        if (!waitlist_tanks.includes(user.id))
                            waitlist_tanks.push(user.id);
                    }
                    yield addParticipantRole(user.id);
                    yield btnInt.editReply({
                        content: totalRegistered < 16
                            ? "You registered as a tank for next raid."
                            : "Raid is full! You’ve been added to the waitlist.",
                    });
                }
                if (btnInt.customId === "raid_dps") {
                    if (totalRegistered < 16) {
                        tanks = tanks.filter((member) => member !== user.id);
                        supports = supports.filter((member) => member !== user.id);
                        if (!dps.includes(user.id))
                            dps.push(user.id);
                    }
                    else {
                        waitlist_tanks = waitlist_tanks.filter((member) => member !== user.id);
                        waitlist_supports = waitlist_supports.filter((member) => member !== user.id);
                        if (!waitlist_dps.includes(user.id))
                            waitlist_dps.push(user.id);
                    }
                    yield addParticipantRole(user.id);
                    yield btnInt.editReply({
                        content: totalRegistered < 16
                            ? "You registered as a dps for next raid."
                            : "Raid is full! You’ve been added to the waitlist.",
                    });
                }
                if (btnInt.customId === "raid_support") {
                    if (totalRegistered < 16) {
                        dps = dps.filter((member) => member !== user.id);
                        tanks = tanks.filter((member) => member !== user.id);
                        if (!supports.includes(user.id))
                            supports.push(user.id);
                    }
                    else {
                        waitlist_dps = waitlist_dps.filter((member) => member !== user.id);
                        waitlist_tanks = waitlist_tanks.filter((member) => member !== user.id);
                        if (!waitlist_supports.includes(user.id))
                            waitlist_supports.push(user.id);
                    }
                    yield addParticipantRole(user.id);
                    yield btnInt.editReply({
                        content: totalRegistered < 16
                            ? "You registered as a support for next raid."
                            : "Raid is full! You’ve been added to the waitlist.",
                    });
                }
                if (btnInt.customId === "raid_remove") {
                    tanks = tanks.filter((member) => member !== user.id);
                    supports = supports.filter((member) => member !== user.id);
                    dps = dps.filter((member) => member !== user.id);
                    waitlist_tanks = waitlist_tanks.filter((member) => member !== user.id);
                    waitlist_supports = waitlist_supports.filter((member) => member !== user.id);
                    waitlist_dps = waitlist_dps.filter((member) => member !== user.id);
                    yield removeParticipantRole(user.id);
                    yield btnInt.editReply({
                        content: "You are not a part of this raid anymore.",
                    });
                }
                // update schema
                yield raidSchema_1.default.findOneAndUpdate({
                    announcementMessageID: announceMsg.id,
                    serverID: raid.serverID,
                }, {
                    $set: {
                        "participants.tank": tanks,
                        "participants.support": supports,
                        "participants.dps": dps,
                        "waitlist.tank": waitlist_tanks,
                        "waitlist.support": waitlist_supports,
                        "waitlist.dps": waitlist_dps,
                    },
                });
                const waitlisted = [
                    ...waitlist_dps,
                    ...waitlist_supports,
                    ...waitlist_tanks,
                ];
                const newEmbed = discord_js_1.EmbedBuilder.from(ogEmbed);
                const persistFields = ((_a = newEmbed.data.fields) === null || _a === void 0 ? void 0 : _a.filter((field) => !["Tanks", "Supports", "DPS"].includes(field.name) &&
                    !field.value.includes("Total Participants"))) || [];
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
                    .setImage("attachment://raid.png")
                    .setFooter({
                    text: `${guild.name} Raids\nBuffs and debuffs will be announced soon.`,
                    iconURL: "attachment://thumbnail.png",
                })
                    .setTimestamp();
                if (waitlisted.length > 0) {
                    newEmbed.addFields({
                        name: "\u200b",
                        value: `${waitlisted.map((user) => `<@${user}>`).join("\n")}`,
                        inline: false,
                    });
                }
                newEmbed.addFields({
                    name: "\u200b",
                    value: `**Total Participants : **${tanks.length + supports.length + dps.length + waitlisted.length}`,
                    inline: false,
                });
                yield announceMsg.edit({
                    embeds: [newEmbed],
                    files: [thumbnail, banner],
                });
            }
            catch (err) {
                console.error("Error in collector on event : ", err);
            }
        }));
        collector.on("end", () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield announceMsg.edit({
                    content: "This raid has already finished.",
                    components: [],
                });
            }
            catch (err) {
                console.error("Error in collector end function : ", err);
            }
        }));
    }
    catch (err) {
        console.error("Error in raid participation collector main function : ", err);
    }
});
exports.attachRaidParticipationCollector = attachRaidParticipationCollector;
const bosses = [
    "roaring_thruma",
    "dark_skull",
    "bison",
    "chimera",
    "celdyte",
    "soteria_the_celestial_halo",
];
const bossElements = [
    "Wind Element",
    "Dark Element",
    "Water Element",
    "Earth Element",
    "Fire Element",
    "Light Element",
];
const sendScoutReminder = (client, raid) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const guild = yield client.guilds.fetch({
            guild: raid.serverID,
            force: true,
        });
        const guildConfig = yield configSchema_1.default.findOne({ serverID: guild.id });
        if (!guildConfig)
            return;
        const { raidConfig } = guildConfig;
        const { managerRoles } = raidConfig;
        // fetch all users from guild that have any of the managerRoles
        const admins = Array.from(guild.members.cache.entries())
            .filter(([_, member]) => {
            for (const role of managerRoles) {
                if (member.roles.cache.get(role))
                    return true;
            }
            return false;
        })
            .map(([_, member]) => member.user);
        const uniqueAdmins = [
            ...new Map(admins.map((admin) => [admin.id, admin])).values(),
        ];
        const reminderEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("📣 Raid Scout Reminder")
            .setDescription(`A raid is scheduled and needs to be scouted.\n\n` +
            `**Raid Bosses : **\n ${raid.bosses
                .map((boss, idx) => `${idx + 1}. **${boss
                .split("_")
                .map((name) => { var _a; return ((_a = name.at(0)) === null || _a === void 0 ? void 0 : _a.toUpperCase()) + name.slice(1); })
                .join(" ")}** - ${bossElements[bosses.indexOf(boss)]}`)
                .join("\n")}\n` +
            `**Scheduled Time:** <t:${Math.floor(raid.raidTimestamps.startTime / 1000)}:F> (<t:${Math.floor(raid.raidTimestamps.startTime / 1000)}:R>)\n\n` +
            `Use \`/raid scout <raid_id>\` on designated guild channel`)
            .addFields({
            name: "\u200b",
            value: `**🪪 Raid ID ** : \`${raid.announcementMessageID}\``,
            inline: false,
        })
            .setColor("Orange")
            .setFooter({
            text: "Please scout and update raid details promptly.",
            iconURL: "attachment://thumbnail.png",
        })
            .setTimestamp();
        // send this message as DM to all users
        for (const admin of uniqueAdmins) {
            try {
                yield admin.send({ embeds: [reminderEmbed], files: [thumbnail] });
            }
            catch (err) {
                if (err.code === 50007) {
                    console.warn(`cannot send scout reminder DM to ${admin}, skipping admin`);
                    continue;
                }
                else
                    throw err;
            }
        }
    }
    catch (err) {
        console.error("Error in scout reminder function : ", err);
    }
});
exports.sendScoutReminder = sendScoutReminder;
const raidRemindParticipants = (client, raid) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const guild = yield client.guilds.fetch(raid.serverID);
        const allParticipants = [
            ...raid.participants.tank,
            ...raid.participants.support,
            ...raid.participants.dps,
        ];
        const banner = new discord_js_1.AttachmentBuilder(raid.bannerUrl).setName("raid.png");
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle("⏰ Raid Reminder!")
            .setDescription(`Hey there, adventurer! This is a friendly reminder that a **guild raid** is approaching.\n\n` +
            `Prepare your gear, sharpen your skills, and don't forget to show up!\n\n` +
            `🗓️ **Raid Time : ** <t:${Math.floor(raid.raidTimestamps.startTime / 1000)}:F>  (<t:${Math.floor(raid.raidTimestamps.startTime / 1000)}:R>)\n` +
            `👾 **Bosses : **\n ${raid.bosses
                .map((boss, idx) => `${idx + 1}. **${boss
                .split("_")
                .map((name) => { var _a; return ((_a = name.at(0)) === null || _a === void 0 ? void 0 : _a.toUpperCase()) + name.slice(1); })
                .join(" ")}** - ${bossElements[bosses.indexOf(boss)]}`)
                .join("\n")}\n`)
            .setColor("Gold")
            .setFooter({
            text: `${guild.name} Guild • Let’s crush it together!`,
            iconURL: "attachment://thumbnail.png",
        })
            .setImage("attachment://raid.png")
            .setTimestamp();
        for (const participant of allParticipants) {
            const user = yield client.users.fetch(participant);
            const userDb = yield userSchema_1.default.findOne({ userID: participant });
            if (userDb && userDb.raids.dmNotif)
                try {
                    yield user.send({ embeds: [embed], files: [thumbnail, banner] });
                }
                catch (err) {
                    if (err.code === 50007) {
                        console.warn(`Cannot send raid reminder DM to ${user.id}, skipping user...`);
                    }
                    else
                        throw err;
                }
        }
    }
    catch (err) {
        console.error("Error in raid reminder function : ", err);
    }
});
exports.raidRemindParticipants = raidRemindParticipants;
function allocateRaidTeamsWithRoles(raid) {
    // Clone arrays to avoid mutation
    const tanks = [...raid.participants.tank];
    const supports = [...raid.participants.support];
    const dps = [...raid.participants.dps];
    const teams = [];
    const used = new Set();
    // 1. Build as many ideal teams as possible (1 tank, 1 support, 2 dps)
    while (teams.length < 4 &&
        tanks.length >= 1 &&
        supports.length >= 1 &&
        dps.length >= 2) {
        const team = [
            { id: tanks.shift(), role: "tank" },
            { id: supports.shift(), role: "support" },
            { id: dps.shift(), role: "dps" },
            { id: dps.shift(), role: "dps" },
        ];
        team.forEach((m) => used.add(m.id));
        teams.push(team);
    }
    // 2. Create a lookup map for role tracking
    const roleMap = new Map();
    for (const id of tanks)
        roleMap.set(id, "tank");
    for (const id of supports)
        roleMap.set(id, "support");
    for (const id of dps)
        roleMap.set(id, "dps");
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
        const team = fillers.slice(i, i + 4).map((id) => ({
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
const announceAllocation = (client, raid) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const guild = yield client.guilds.fetch(raid.serverID);
        const guildConfig = yield configSchema_1.default.findOne({ serverID: guild.id });
        if (!guildConfig)
            return;
        const { raidConfig } = guildConfig;
        const { supportEmojiID, tankEmojiID, dpsEmojiID, raidChannelID, participantRole, } = raidConfig;
        const channel = yield guild.channels.fetch(raidChannelID);
        if (!channel || channel.type !== discord_js_1.ChannelType.GuildText)
            return;
        const tankEmoji = (0, fetchEmojis_1.fetchEmojis)(client, tankEmojiID);
        const dpsEmoji = (0, fetchEmojis_1.fetchEmojis)(client, dpsEmojiID);
        const supportEmoji = (0, fetchEmojis_1.fetchEmojis)(client, supportEmojiID);
        const rolesEmojiMap = new Map([
            ["tank", tankEmoji],
            ["support", supportEmoji],
            ["dps", dpsEmoji],
        ]);
        const { teams, waitlist } = allocateRaidTeamsWithRoles(raid);
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle("🛡️ Raid Team Allocation")
            .setColor("Gold")
            .setDescription(`📢 **Raid team assignments are complete!**\n\n` +
            `Each team consists of up to **4 adventurers**\n\n` +
            `We've prioritized balanced roles wherever possible, but some teams may be more damage-heavy due to class availability.\n\n` +
            `⏳ Players who registered but didn't make the main roster have been placed on the **waitlist** and may be subbed in if needed.\n\n` +
            `Prepare yourselves — the raid begins soon!`)
            .addFields({
            name: "\u200b",
            value: `**🪪 Raid ID ** : \`${raid.announcementMessageID}\``,
            inline: false,
        })
            .setFooter({
            text: "If you die, it's probably your fault. Scouts out. Meet you guys at raid.",
            iconURL: "attachment://thumbnail.png",
        })
            .setTimestamp();
        // Format each team
        teams.forEach((team, idx) => {
            const members = team
                .map((member) => `${rolesEmojiMap.get(member.role) || ""} <@${member.id}>`)
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
                .map((member) => `${rolesEmojiMap.get(member.role) || ""} <@${member.id}>`)
                .join("\n");
            embed.addFields({
                name: "⏳ Waitlist",
                value: waitlistStr,
                inline: false,
            });
        }
        const role_req = yield guild.roles.fetch(participantRole, { force: true });
        const allocationMsg = yield channel.send({
            content: role_req ? `${role_req}` : "",
            allowedMentions: { roles: role_req ? [role_req.id] : [] },
            embeds: [embed],
            files: [thumbnail],
        });
        // also change the original message of announcement, remove components and add link button to
        // allocation message
        // find the message
        const announceMsg = yield channel.messages.fetch(raid.announcementMessageID);
        const link = `https://discord.com/channels/${guild.id}/${channel.id}/${allocationMsg.id}`;
        const linkButton = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setLabel("Jumpt to team allocation")
            .setStyle(discord_js_1.ButtonStyle.Link)
            .setURL(link));
        // only get the link button
        const allActionRows = announceMsg.components.map((row) => discord_js_1.ActionRowBuilder.from(row));
        // filter them now
        const persistComponents = allActionRows
            .map((row) => {
            const filteredButtons = row.components.filter((component) => {
                return (component instanceof discord_js_1.ButtonBuilder &&
                    component.data.style === discord_js_1.ButtonStyle.Link);
            });
            if (!filteredButtons.length)
                return null;
            return new discord_js_1.ActionRowBuilder().addComponents(filteredButtons);
        })
            .filter((row) => row !== null);
        yield announceMsg.edit({ components: [...persistComponents, linkButton] });
        // update schema as well
        yield raidSchema_1.default.findOneAndUpdate({
            announcementMessageID: raid.announcementMessageID,
        }, {
            $set: {
                teamAllotmentMessageID: allocationMsg.id,
                stage: "alloted",
                "raidTimestamps.allotmentTime": Date.now(),
            },
        });
    }
    catch (err) {
        console.error("Error in allocation and annoucnement function");
    }
});
exports.announceAllocation = announceAllocation;
const raidReviewReminder = (client, raid) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const guild = yield client.guilds.fetch(raid.serverID);
        const guildConfig = yield configSchema_1.default.findOne({ serverID: guild.id });
        if (!guildConfig)
            return;
        const { raidConfig } = guildConfig;
        const { managerRoles } = raidConfig;
        // get all admins
        const admins = Array.from(guild.members.cache.entries())
            .map(([_, member]) => member)
            .filter((member) => {
            for (const role of managerRoles)
                if (member.roles.cache.get(role))
                    return true;
            return false;
        })
            .map((member) => member.user);
        const uniqueAdmins = [
            ...new Map(admins.map((admin) => [admin.id, admin])).values(),
        ];
        const reviewEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("📋 Raid Participation Review")
            .setColor("Blue")
            .setDescription(`The raid has concluded. Please take a moment to review attendance and note any discrepancies between sign-ups and actual participation.\n\n` +
            `🔍 **Action Required:**\n` +
            `• Cross-check in-game attendance against the reaction list.\n` +
            `• Mark any absentees who did not provide prior notice.\n` +
            `• Record any substitutions or unexpected participants.\n\n` +
            `Maintaining accurate records ensures smoother coordination and accountability for future events.\n` +
            `Use command \`/raid review <raid_id>\` on the designated guild channel.`)
            .addFields({
            name: "\u200b",
            value: `**🪪 Raid ID : ${raid.announcementMessageID}`,
            inline: false,
        })
            .setFooter({
            text: "Thank you for your support and cooperation.",
            iconURL: "attachment://thumbnail.png",
        })
            .setTimestamp();
        for (const admin of uniqueAdmins) {
            try {
                yield admin.send({ embeds: [reviewEmbed] });
            }
            catch (err) {
                if (err.code === 50007) {
                    console.warn(`Cannot send review reminder DM to ${admin.id}, skipping admin...`);
                }
                else
                    throw err;
            }
        }
    }
    catch (err) {
        console.error("Error in raid review reminder function : ", err);
    }
});
exports.raidReviewReminder = raidReviewReminder;
const calculateReliability = (completed, noShow) => {
    const total = completed + noShow;
    return Math.round((completed / total) * 100);
};
exports.calculateReliability = calculateReliability;
