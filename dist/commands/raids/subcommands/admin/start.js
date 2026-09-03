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
const discord_js_1 = require("discord.js");
const configSchema_1 = __importDefault(require("../../../../models/configSchema"));
const raidUtils_1 = require("../../../../utils/raidUtils");
const helperArrays_1 = require("../../../../data/helperArrays");
const raidSchema_1 = __importDefault(require("../../../../models/raidSchema"));
const fetchEmojis_1 = require("../../../../utils/fetchEmojis");
const validBosses = [
    "roaring_thruma",
    "dark_skull",
    "bison",
    "chimera",
    "celdyte",
    "soteria_the_celestial_halo",
];
const bossElements = ["Wind", "Dark", "Water", "Earth", "Fire", "Light"];
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
const bossOptions = Array.from({ length: validBosses.length }).map((_, idx) => ({
    name: `boss_${idx + 1}`,
    description: `Choose boss #${idx + 1}`,
    type: discord_js_1.ApplicationCommandOptionType.String,
    required: idx === 0, // only first boss is required
    choices: validBossesMapped,
}));
const daysOption = {
    name: "day",
    description: "Day of the week.",
    type: discord_js_1.ApplicationCommandOptionType.Number,
    required: false,
    choices: daysMapped,
};
const timeOption = {
    name: "time",
    description: "Time of the day. (eg. 20:30, in JST)",
    type: discord_js_1.ApplicationCommandOptionType.String,
    required: false,
};
// start a new raid
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "start",
                description: "Start a new guild raid",
                options: [...bossOptions, daysOption, timeOption],
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b;
                try {
                    const guild = interaction.guild;
                    const channel = interaction.channel;
                    if (!guild || !channel || channel.type !== discord_js_1.ChannelType.GuildText) {
                        yield interaction.editReply({
                            content: "⚠️ Invalid command. Please check your input and try again.",
                        });
                        return;
                    }
                    // get all bosses
                    const selectedBosses = [];
                    for (let i = 1; i <= 5; i++) {
                        const boss = interaction.options.getString(`boss_${i}`);
                        if (boss)
                            selectedBosses.push(boss);
                    }
                    // handle duplicates
                    const duplicates = selectedBosses.filter((boss, idx, arr) => arr.indexOf(boss) !== idx);
                    if (duplicates.length > 0) {
                        yield interaction.editReply({
                            content: `Duplicate boss selection found : ${[
                                ...new Set(duplicates),
                            ].join(",")}`,
                        });
                        return;
                    }
                    // send an embed at raid channel for raid
                    const guildConfig = yield configSchema_1.default.findOne({ serverID: guild.id });
                    if (!guildConfig) {
                        yield interaction.editReply({ content: "No guild config found." });
                        return;
                    }
                    const { raidConfig } = guildConfig;
                    const { raidDay, raidTime, tankEmojiID, supportEmojiID, dpsEmojiID, raidRole, participantRole, } = raidConfig;
                    const currTime = Date.now();
                    // cannot start a new raid if a raid is already scheduled, that is the currtime is smaller than
                    // the startime of latest raid
                    const raids = yield raidSchema_1.default.find({ serverID: guild.id }).sort({
                        "raidTimestamps.startTime": -1,
                    });
                    if (raids.length) {
                        const latestRaid = raids[0];
                        if (!latestRaid.raidTimestamps.finishTime &&
                            latestRaid.raidTimestamps.startTime > currTime) {
                            yield interaction.editReply({
                                content: "Cannot start a new raid when a raid is already scheduled.",
                            });
                            return;
                        }
                    }
                    const day = (_a = interaction.options.getNumber("day")) !== null && _a !== void 0 ? _a : raidDay;
                    const time = (_b = interaction.options.getString("time")) !== null && _b !== void 0 ? _b : raidTime;
                    const relativeTime = (0, raidUtils_1.getRelativeDiscordTime)(day + 1, time); //gives unix epoch in seconds
                    // cannot create a raid with time that is less than 3 hours close
                    const threshold = 3 * 60 * 60 * 1000; //3 hours
                    const startTime = relativeTime * 1000;
                    if (startTime - currTime < threshold) {
                        yield interaction.editReply({
                            content: "⚠️ Raid start time must be at least 3 hours from now. Please schedule accordingly.",
                        });
                        return;
                    }
                    const thumbnail = new discord_js_1.AttachmentBuilder(helperArrays_1.leaderboardThumbnail).setName("thumbnail.png");
                    const raidMessage = helperArrays_1.raidMessages[Math.floor(Math.random() * helperArrays_1.raidMessages.length)].replace(/<t:TIMESTAMP:[FR]>/g, `<t:${relativeTime}:F> (<t:${relativeTime}:R>)`);
                    const [raidImage, raidImageUrl] = (0, raidUtils_1.getRandomRaidImage)();
                    const tankEmoji = (0, fetchEmojis_1.fetchEmojis)(client, tankEmojiID);
                    const dpsEmoji = (0, fetchEmojis_1.fetchEmojis)(client, dpsEmojiID);
                    const supportEmoji = (0, fetchEmojis_1.fetchEmojis)(client, supportEmojiID);
                    const raidEmbed = new discord_js_1.EmbedBuilder()
                        .setTitle(`${guild.name} Guild Raids`)
                        .setColor("DarkRed")
                        .addFields({ name: "\u200b", value: raidMessage, inline: false }, {
                        name: "\u200b",
                        value: `**Bosses : **\n${selectedBosses
                            .map((boss, idx) => {
                            var _a;
                            return `${idx + 1}. **${(_a = validBossesMapped.find((b) => b.value === boss)) === null || _a === void 0 ? void 0 : _a.name}** - ${bossElements[validBosses.indexOf(boss)]} Element`;
                        })
                            .join("\n")}`,
                        inline: false,
                    }, {
                        name: "\u200b",
                        value: `\n💬 Pick your role below : `,
                        inline: false,
                    }, {
                        name: `\n`,
                        value: `${dpsEmoji} **DPS** - Be the damage. Live fast, crit hard.`,
                        inline: false,
                    }, {
                        name: `\n`,
                        value: `${supportEmoji} **SUPPORT** - Buff the party, carry the team emotionally.`,
                        inline: false,
                    }, {
                        name: `\n`,
                        value: `${tankEmoji} **TANK** - Take the hits, flex your aggro.`,
                        inline: false,
                    }, {
                        name: "\u200b",
                        value: "Use ❌ to de-register from raid.",
                        inline: false,
                    })
                        .setImage("attachment://raid.png")
                        .setFooter({
                        text: `${guild.name} Raids\nBuffs and debuffs will be announced soon.`,
                        iconURL: "attachment://thumbnail.png",
                    })
                        .setTimestamp();
                    yield interaction.editReply({ content: "Raid process started..." });
                    const role_req = yield guild.roles.fetch(raidRole, { force: true });
                    const raidMsg = yield channel.send({
                        content: role_req ? `${role_req}` : "",
                        allowedMentions: { roles: role_req ? [role_req.id] : [] },
                        embeds: [raidEmbed],
                        files: [thumbnail, raidImage],
                    });
                    raidEmbed.addFields({
                        name: "\u200b",
                        value: `**🪪 Raid ID ** : \`${raidMsg.id}\``,
                        inline: false,
                    });
                    yield raidMsg.edit({ embeds: [raidEmbed] });
                    // update raid schema
                    const newRaid = new raidSchema_1.default({
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
                    yield newRaid.save();
                    // attach collector for participation
                    yield (0, raidUtils_1.attachRaidParticipationCollector)(client, newRaid);
                    // send scout reminder embed 24 hrs before raid time, take edge case in consideration
                    // what if admin creates a raid that is within next few hours (less than 24)
                    // if that's the case send scout reminder immediately
                    const isWithin24H = startTime - currTime < 24 * 60 * 60 * 1000;
                    const scoutTimers = new Set(), allocationTimers = new Set(), reminderTimers = new Set(), reviewTimers = new Set();
                    if (!scoutTimers.has(raidMsg.id)) {
                        scoutTimers.add(raidMsg.id);
                        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                            try {
                                const freshRaid = yield raidSchema_1.default.findOne({
                                    announcementMessageID: raidMsg.id,
                                    serverID: guild.id,
                                });
                                if (freshRaid &&
                                    freshRaid.stage !== "scout_reminded" &&
                                    (!freshRaid.bossBuffsImageUrl.length ||
                                        !freshRaid.bossDebuffsImageUrl.length)) {
                                    yield (0, raidUtils_1.sendScoutReminder)(client, freshRaid);
                                    freshRaid.stage = "scout_reminded";
                                    yield freshRaid.save();
                                }
                            }
                            catch (err) {
                                console.error("Error in scout reminder timer : ", err);
                            }
                        }), isWithin24H ? 1000 : startTime - 24 * 60 * 60 * 1000 - currTime);
                    }
                    if (!allocationTimers.has(raidMsg.id)) {
                        allocationTimers.add(raidMsg.id);
                        // allocate teams and send a message, do this 1 hr before raid
                        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                            try {
                                const freshRaid = yield raidSchema_1.default.findOne({
                                    announcementMessageID: raidMsg.id,
                                    serverID: guild.id,
                                });
                                if (freshRaid)
                                    yield (0, raidUtils_1.announceAllocation)(client, freshRaid);
                            }
                            catch (err) {
                                console.error("Error in team allocation timer : ", err);
                            }
                        }), startTime - currTime - 60 * 60 * 1000);
                    }
                    if (!reminderTimers.has(raidMsg.id)) {
                        reminderTimers.add(raidMsg.id);
                        // send a reminder to all participants 30 minutes before raid
                        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                            try {
                                const freshRaid = yield raidSchema_1.default.findOne({
                                    announcementMessageID: raidMsg.id,
                                    serverID: guild.id,
                                });
                                if (freshRaid)
                                    yield (0, raidUtils_1.raidRemindParticipants)(client, freshRaid);
                            }
                            catch (err) {
                                console.error("Error in raid reminder timer : ", err);
                            }
                        }), startTime - currTime - 30 * 60 * 1000);
                    }
                    if (!reviewTimers.has(raidMsg.id)) {
                        reviewTimers.add(raidMsg.id);
                        // timer for sending a review reminder, do this 3 hour after raid
                        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                            const freshRaid = yield raidSchema_1.default.findOneAndUpdate({
                                announcementMessageID: raidMsg.id,
                                serverID: guild.id,
                            }, {
                                $set: {
                                    stage: "finished",
                                    "raidTimestamps.finishTime": Date.now(),
                                },
                            }, { new: true });
                            const role = yield guild.roles.fetch(participantRole, {
                                force: true,
                            });
                            // gotta remove participant role from all the members
                            const removeRole = (userID) => __awaiter(void 0, void 0, void 0, function* () {
                                try {
                                    const member = yield guild.members.fetch({
                                        user: userID,
                                        force: true,
                                    });
                                    if (!member || !role)
                                        return;
                                    yield member.roles.remove(role);
                                }
                                catch (err) {
                                    console.error("Error removing particiaption role after raid has been finished : ", err);
                                }
                            });
                            if (freshRaid && !freshRaid.raidTimestamps.reviewTime) {
                                const joining = freshRaid.participants;
                                const waitListed = freshRaid.waitlist;
                                const participants = [
                                    ...joining.tank,
                                    ...joining.dps,
                                    ...joining.support,
                                    ...waitListed.tank,
                                    ...waitListed.dps,
                                    ...waitListed.support,
                                ];
                                for (const participant of participants) {
                                    yield removeRole(participant);
                                }
                                yield (0, raidUtils_1.raidReviewReminder)(client, freshRaid);
                            }
                        }), startTime - currTime + 3 * 60 * 60 * 1000);
                    }
                }
                catch (err) {
                    console.error("Error in raid start subcommand callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in raid start subcommand : ", err);
        return undefined;
    }
});
exports.default = init;
