"use strict";
// command that will review a raid, that is check on particpation list and this is where
// user schema are updated and users are given reliability score
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
const raidSchema_1 = __importDefault(require("../../../../models/raidSchema"));
const helperArrays_1 = require("../../../../data/helperArrays");
const raidUtils_1 = require("../../../../utils/raidUtils");
const userSchema_1 = __importDefault(require("../../../../models/userSchema"));
const permissionsCheck_1 = require("../../../../utils/permissionsCheck");
// so if an admin doesn't review a raid it's on them entirely
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "review",
                description: "Review raid participation.",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "raid_id",
                        description: "Raid ID of raid to be reviewed",
                        type: discord_js_1.ApplicationCommandOptionType.String,
                        required: true,
                    },
                ],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const channel = interaction.channel;
                    const raid_id = interaction.options.getString("raid_id");
                    if (!raid_id || !channel || channel.type !== 0) {
                        yield interaction.editReply({
                            content: "⚠️ Invalid command. Please check your input and try again.",
                        });
                        return;
                    }
                    //   find raid
                    const raid = yield raidSchema_1.default.findOne({
                        announcementMessageID: raid_id,
                    }).lean();
                    if (!raid) {
                        yield interaction.editReply({ content: "No raid found." });
                        return;
                    }
                    yield interaction.editReply({
                        content: "Raid review process started...",
                    });
                    const allParticipants = [
                        ...raid.participants.dps,
                        ...raid.participants.tank,
                        ...raid.participants.support,
                    ];
                    const guild = yield client.guilds.fetch(raid.serverID);
                    // fetch all participants concurrently without letting one missing member fail the rest
                    const memberResults = yield Promise.allSettled(allParticipants.map((participant) => guild.members.fetch(participant).catch(() => null)));
                    const participants = [];
                    for (const result of memberResults) {
                        if (result.status === "fulfilled" && result.value) {
                            participants.push(result.value);
                        }
                    }
                    const thumbnail = new discord_js_1.AttachmentBuilder(helperArrays_1.leaderboardThumbnail).setName("thumbnail.png");
                    const reviewEmbed = new discord_js_1.EmbedBuilder()
                        .setColor("DarkVividPink")
                        .setTitle("Raid Participation Review")
                        .setDescription("List of all the people who particpated and those who didn't show up. not showing up after partiicpation may lead to a low reliabilit score (needed to gain Giveaway ranks)")
                        .addFields({ name: "\u200b", value: "**Attendees : **", inline: true }, { name: "\u200b", value: "**Absentees : **", inline: true })
                        .setThumbnail("attachment://thumbnail.png")
                        .setTimestamp();
                    const attendanceMenus = [
                        new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.UserSelectMenuBuilder()
                            .setCustomId("present")
                            .setPlaceholder("Mark present")
                            .setMaxValues(25)
                            .setMinValues(0)),
                        new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.UserSelectMenuBuilder()
                            .setCustomId("absent")
                            .setPlaceholder("Mark absent")
                            .setMaxValues(25)
                            .setMinValues(0)),
                    ];
                    const starterMessage = [
                        "📌 **Raid Review Instructions**",
                        "",
                        "**Steps to Review Participation**",
                        "1. **Mark Attendees** – use the `Present` select menu to choose members who **attended**.",
                        "2. **Mark Absentees** – use the `Absent` select menu to choose members who **did not show up**.",
                        "3. **Finish** – run `!review finish` **only** when you’re sure the review is complete. This will **delete the thread**.",
                        "",
                        "**Important Notes**",
                        "• Only members with **Raid Management** roles can interact in this thread.",
                        "• Reliability scores are updated from your selections and affect giveaway eligibility.",
                    ].join("\n");
                    const reviewThread = yield channel.threads.create({
                        name: "Raid review",
                        autoArchiveDuration: 60 * 24,
                    });
                    yield reviewThread.send({ content: starterMessage });
                    const attendanceMsg = yield reviewThread.send({
                        embeds: [reviewEmbed],
                        files: [thumbnail],
                        components: [...attendanceMenus],
                    });
                    const compCollector = attendanceMsg.createMessageComponentCollector({
                        filter: (i) => !i.user.bot && ["present", "absent"].includes(i.customId),
                        time: 0,
                    });
                    let presentIDs = new Set();
                    let absentIDs = new Set();
                    compCollector.on("collect", (i) => __awaiter(void 0, void 0, void 0, function* () {
                        try {
                            if (!i.isUserSelectMenu())
                                return;
                            yield i.deferReply({ flags: "Ephemeral" });
                            if (!(yield (0, permissionsCheck_1.isManager)(client, i.user.id, guild.id, "raid"))) {
                                yield i.editReply({
                                    content: "You do not have the required permissions.",
                                });
                                return;
                            }
                            if (i.customId === "present") {
                                presentIDs = new Set(i.values);
                                for (const id of i.values)
                                    absentIDs.delete(id);
                                yield i.editReply({ content: "Users marked present." });
                            }
                            if (i.customId === "absent") {
                                absentIDs = new Set(i.values);
                                for (const id of i.values)
                                    presentIDs.delete(id);
                                yield i.editReply({ content: "Users marked absent." });
                            }
                            const fetchUserSafely = (id) => __awaiter(void 0, void 0, void 0, function* () {
                                const cached = client.users.cache.get(id);
                                if (cached)
                                    return cached;
                                return client.users.fetch(id).catch(() => null);
                            });
                            const [presentUsers, absentUsers] = yield Promise.all([
                                Promise.all([...presentIDs].map((id) => fetchUserSafely(id))),
                                Promise.all([...absentIDs].map((id) => fetchUserSafely(id))),
                            ]);
                            const present = presentUsers.filter((u) => u !== null);
                            const absent = absentUsers.filter((u) => u !== null);
                            // Update attendee and absentee reliability concurrently
                            const updatePresentTasks = present.map((user) => __awaiter(void 0, void 0, void 0, function* () {
                                const updatedUser = yield userSchema_1.default.findOneAndUpdate({ userID: user.id }, {
                                    $addToSet: { "raids.completed": raid._id },
                                    $pull: { "raids.noShows": raid._id },
                                }, { new: true });
                                if (updatedUser) {
                                    updatedUser.raids.reliability = (0, raidUtils_1.calculateReliability)(updatedUser.raids.completed.length, updatedUser.raids.noShows.length);
                                    yield updatedUser.save();
                                }
                            }));
                            const updateAbsentTasks = absent.map((user) => __awaiter(void 0, void 0, void 0, function* () {
                                const updatedUser = yield userSchema_1.default.findOneAndUpdate({ userID: user.id }, {
                                    $addToSet: { "raids.noShows": raid._id },
                                    $pull: { "raids.completed": raid._id },
                                }, { new: true });
                                if (updatedUser) {
                                    updatedUser.raids.reliability = (0, raidUtils_1.calculateReliability)(updatedUser.raids.completed.length, updatedUser.raids.noShows.length);
                                    yield updatedUser.save();
                                }
                            }));
                            yield Promise.all([...updatePresentTasks, ...updateAbsentTasks]);
                            reviewEmbed.setFields({
                                name: "\u200b",
                                value: `**Present : **\n${present.map((m) => m.displayName).join("\n") || "None"}`,
                                inline: true,
                            }, {
                                name: "\u200b",
                                value: `**Absent : **\n${absent.map((m) => m.displayName).join("\n") || "None"}`,
                                inline: true,
                            });
                            yield attendanceMsg.edit({ embeds: [reviewEmbed] });
                        }
                        catch (err) {
                            console.error("Error in compCollector collect event : ", err);
                        }
                    }));
                    const msgCollector = reviewThread.createMessageCollector({
                        filter: (msg) => !msg.author.bot,
                        time: 0,
                    });
                    msgCollector.on("collect", (msg) => __awaiter(void 0, void 0, void 0, function* () {
                        try {
                            if (!(yield (0, permissionsCheck_1.isManager)(client, msg.author.id, guild.id, "raid"))) {
                                yield reviewThread.send({
                                    content: "You do not have permission to chat...",
                                });
                                return;
                            }
                            if (msg.content === "!review finish") {
                                yield reviewThread.send({
                                    content: "Please wait while we process your request.",
                                });
                                // update raid in db
                                yield raidSchema_1.default.findOneAndUpdate({
                                    serverID: guild.id,
                                    announcementMessageID: raid.announcementMessageID,
                                }, {
                                    $set: {
                                        stage: "finished",
                                        "raidTimestamps.reviewTime": Date.now(),
                                    },
                                });
                                yield reviewThread.delete();
                            }
                        }
                        catch (err) {
                            console.error("Error in review thread message collector : ", err);
                        }
                    }));
                }
                catch (err) {
                    console.error("Error in raid review subcommand callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in raid review subcommand : ", err);
        return undefined;
    }
});
exports.default = init;
