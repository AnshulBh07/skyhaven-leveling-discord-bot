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
exports.getGquestMazeLeaderboard = exports.generateGquestsListEmbed = exports.getContributionScore = exports.attachQuestMazeReviewCollector = void 0;
const discord_js_1 = require("discord.js");
const configSchema_1 = __importDefault(require("../models/configSchema"));
const helperArrays_1 = require("../data/helperArrays");
const generateGquestMazeLeaderboardImage_1 = require("../canvas/generateGquestMazeLeaderboardImage");
const guildQuestsSchema_1 = __importDefault(require("../models/guildQuestsSchema"));
const mazeSchema_1 = __importDefault(require("../models/mazeSchema"));
const userSchema_1 = __importDefault(require("../models/userSchema"));
const permissionsCheck_1 = require("./permissionsCheck");
const thumbnail = new discord_js_1.AttachmentBuilder(helperArrays_1.leaderboardThumbnail).setName("thumbnail.png");
const attachQuestMazeReviewCollector = (client_1, gquestMazeData_1, ...args_1) => __awaiter(void 0, [client_1, gquestMazeData_1, ...args_1], void 0, function* (client, gquestMazeData, type = "gq") {
    try {
        const guild = yield client.guilds.fetch(gquestMazeData.serverID);
        const channel = yield guild.channels.fetch(gquestMazeData.channelID, {
            force: true,
        });
        if (!channel || channel.type !== 0)
            return;
        let message = null;
        try {
            message = yield channel.messages.fetch({
                message: gquestMazeData.messageID,
                force: true,
            });
        }
        catch (err) {
            if (err.code === 10008) {
                console.warn(`Cannot find gquest/maze : ${gquestMazeData.messageID}, skipping attaching collector...`);
            }
            else
                throw err;
        }
        if (!message)
            return;
        // create buttons and edit reply again, we didn't create them before to avoid interaction failure
        const buttonsRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId("reward")
            .setEmoji("💵")
            .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
            .setCustomId("reject")
            .setEmoji("❌")
            .setStyle(discord_js_1.ButtonStyle.Secondary));
        yield message.edit({ components: [buttonsRow] });
        // attach collector
        const collector = message.createMessageComponentCollector({
            filter: (i) => ["reward", "reject"].includes(i.customId),
            time: 0,
        });
        collector.on("collect", (btnInt) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const customId = btnInt.customId;
                const isReward = customId === "reward";
                const isReject = customId === "reject";
                if (isReject) {
                    const modal = new discord_js_1.ModalBuilder()
                        .setCustomId(`${type}_rejection_modal_${gquestMazeData.messageID}`)
                        .setTitle(`Guild ${type === "gq" ? "Quest" : "Maze"} Rejection`);
                    const reasonInput = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.TextInputBuilder()
                        .setCustomId("reason")
                        .setLabel("Reason : ")
                        .setStyle(discord_js_1.TextInputStyle.Paragraph)
                        .setRequired(true));
                    modal.addComponents(reasonInput);
                    yield btnInt.showModal(modal);
                }
                // manage button click now
                // rejection opens a modal whereas rewarding asks for a screenshot from user
                // rewarding will be handled in message create event
                if (isReward) {
                    yield btnInt.deferReply({ flags: "Ephemeral" });
                    const guildConfig = yield configSchema_1.default.findOne({ serverID: guild.id });
                    if (!guildConfig) {
                        yield btnInt.editReply({
                            content: "Config not found.",
                        });
                        return;
                    }
                    const { gquestMazeConfig } = guildConfig;
                    if (!gquestMazeConfig) {
                        yield btnInt.editReply({
                            content: "GQuest/Maze config missing.",
                        });
                        return;
                    }
                    const isAuthorized = yield (0, permissionsCheck_1.isManager)(client, btnInt.user.id, guildConfig.serverID, type);
                    if (!isAuthorized) {
                        yield btnInt.editReply({
                            content: "❌ You do not have the permission to perform this action.",
                        });
                        return;
                    }
                    if (type === "gq")
                        yield guildQuestsSchema_1.default.findOneAndUpdate({ messageID: gquestMazeData.messageID }, { $set: { lastRewardBtnClickAt: Date.now() } });
                    if (type === "mz")
                        yield mazeSchema_1.default.findOneAndUpdate({
                            messageID: gquestMazeData.messageID,
                        }, { $set: { lastRewardBtnClickAt: Date.now() } });
                    const user = yield client.users.fetch(gquestMazeData.userID, {
                        force: true,
                    });
                    // create a thread that will be used by admin to submit proof within 2 minutes
                    const proofSubThread = yield channel.threads.create({
                        name: `${user.displayName} Reward Proof Submission by Admin`,
                        autoArchiveDuration: 60,
                    });
                    yield btnInt.editReply({
                        content: "Please continue the process in thread.",
                    });
                    yield proofSubThread.send({
                        content: `📸 Please send the in-game screenshot of the reward trade with user <@${gquestMazeData.userID}>. Kindly submit it within the next 2 minutes.`,
                    });
                    // add a message collector to thread
                    const collector = proofSubThread.createMessageCollector({
                        filter: (msg) => !msg.author.bot,
                        time: 60000 * 2,
                    });
                    collector.on("collect", (msg) => __awaiter(void 0, void 0, void 0, function* () {
                        try {
                            if (msg.author.id !== btnInt.user.id) {
                                yield proofSubThread.send({
                                    content: "❌ You do not have permission to perform this action.",
                                });
                                return;
                            }
                            if (msg.content.length > 0) {
                                yield proofSubThread.send("Please send image for submission only.");
                                return;
                            }
                            // get attachment
                            const attachments = Array.from(msg.attachments.entries()).map(([_, attachment]) => attachment);
                            // check for invalid submissions
                            if (attachments.length > 1 ||
                                attachments.some((attachment) => attachment.contentType &&
                                    !attachment.contentType.startsWith("image/"))) {
                                yield proofSubThread.send("❌ Invalid submission.");
                                return;
                            }
                            yield proofSubThread.send({
                                content: "🔄 Processing your submission. Please wait...",
                            });
                            const proofImage = new discord_js_1.AttachmentBuilder(attachments[0].url).setName("proof_image.png");
                            const updateOpt = {
                                $set: {
                                    status: "rewarded",
                                    rewardedAt: Date.now(),
                                    reviewedBy: btnInt.user.id,
                                },
                            };
                            let updatedDoc;
                            // update the maze or gquest
                            if (type === "gq")
                                updatedDoc = yield guildQuestsSchema_1.default.findOneAndUpdate({ messageID: message.id }, updateOpt);
                            else
                                updatedDoc = yield mazeSchema_1.default.findOneAndUpdate({ messageID: message.id }, updateOpt);
                            if (!updatedDoc)
                                return;
                            // update user
                            const userUpdateOpt = type === "gq"
                                ? {
                                    $pull: { "gquests.pending": updatedDoc._id },
                                    $push: { "gquests.rewarded": updatedDoc._id },
                                    $set: { "gquests.lastRewardedAt": new Date() },
                                    $inc: {
                                        "gquests.totalRewarded": updatedDoc.gquestCount *
                                            gquestMazeConfig.gquestRewardAmount,
                                    },
                                }
                                : {
                                    $pull: { "mazes.pending": updatedDoc._id },
                                    $push: { "mazes.rewarded": updatedDoc._id },
                                    $set: { "mazes.lastRewardedAt": new Date() },
                                    $inc: {
                                        "mazes.totalRewarded": (gquestMazeConfig.mazeRewardAmount *
                                            (updatedDoc.endFloor -
                                                updatedDoc.startFloor)) /
                                            100,
                                    },
                                };
                            const updatedUser = yield userSchema_1.default.findOneAndUpdate({ userID: gquestMazeData.userID }, userUpdateOpt, { new: true });
                            if (!updatedUser)
                                return;
                            // send a reward message to the associated channel
                            const rewardEmbed = new discord_js_1.EmbedBuilder()
                                .setTitle(`💵 ${type === "gq" ? "Guild Quest" : "Guild Maze"} Rewarded`)
                                .setColor("Aqua")
                                .addFields({
                                name: "\u200b",
                                value: `**📤 Submitted by : **<@${updatedDoc.userID}>`,
                                inline: false,
                            }, {
                                name: "\u200b",
                                value: `**📝 Reviewed by : **<@${btnInt.user.id}>`,
                                inline: false,
                            }, {
                                name: "\u200b",
                                value: `**🕒 Rewarded On : **<t:${Math.floor(Date.now() / 1000)}:F>`,
                            }, {
                                name: "👤 User Status",
                                value: `**Total Pending : **${type === "gq"
                                    ? updatedUser.gquests.pending.length
                                    : updatedUser.mazes.pending.length}\n**Total Rewarded : **${type === "gq"
                                    ? updatedUser.gquests.rewarded.length
                                    : updatedUser.mazes.rewarded.length}`,
                                inline: false,
                            }, {
                                name: "\u200b",
                                value: `**🪪 ${type.split("")[0].toUpperCase() + type.slice(1)} ID : **\`${updatedDoc.messageID}\``,
                                inline: false,
                            })
                                .setFooter({
                                text: `${guild.name} Guild Quests and Mazes`,
                                iconURL: "attachment://thumbnail.png",
                            })
                                .setImage("attachment://proof_image.png")
                                .setTimestamp();
                            // send a message on channel
                            const rewardMessage = yield channel.send({
                                embeds: [rewardEmbed],
                                files: [proofImage, thumbnail],
                            });
                            // update gquest / maze model
                            updatedDoc.rewardMessageID = rewardMessage.id;
                            updatedDoc.proofImageUrl = attachments[0].url;
                            yield updatedDoc.save();
                            // edit the previous submission message, remove buttons add a link to new reward message
                            const messageLink = `https://discord.com/channels/${guild.id}/${channel.id}/${rewardMessage.id}`;
                            const LinkButton = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                                .setLabel("Jump to reward message")
                                .setURL(messageLink)
                                .setStyle(discord_js_1.ButtonStyle.Link));
                            yield message.edit({
                                components: [LinkButton],
                            });
                            // send notif to user and delete thread at last
                            const sendNotif = type === "gq"
                                ? updatedUser.gquests.dmNotif
                                : updatedUser.mazes.dmNotif;
                            // send at dm
                            if (sendNotif) {
                                try {
                                    const targetUser = yield client.users.fetch(updatedDoc.userID);
                                    yield targetUser.send({
                                        embeds: [rewardEmbed],
                                        files: [proofImage, thumbnail],
                                    });
                                }
                                catch (err) {
                                    console.warn("Cannot send DM to user");
                                }
                            }
                            yield proofSubThread.delete();
                        }
                        catch (err) {
                            console.error("Error in reward collector inside thread : ", err);
                        }
                    }));
                    collector.on("end", (collected, reason) => __awaiter(void 0, void 0, void 0, function* () {
                        try {
                            if (reason === "time" && collected.size === 0) {
                                yield btnInt.editReply("⏱️ Interaction timed out. Please try submitting again.");
                            }
                        }
                        catch (err) {
                            console.error("Error in proof image collector thread end event : ", err);
                        }
                        finally {
                            try {
                                yield proofSubThread.delete();
                            }
                            catch (err) {
                                if (err instanceof discord_js_1.DiscordAPIError && err.code === 10003) {
                                    console.log("Thread was already deleted.");
                                }
                                else {
                                    console.error("Error deleting thread in finally block:", err);
                                }
                            }
                        }
                    }));
                }
            }
            catch (err) {
                console.error("Error in gquest/maze collector collect event : ", err);
            }
        }));
    }
    catch (err) {
        console.error("Error in gquest/maze collector function : ", err);
    }
});
exports.attachQuestMazeReviewCollector = attachQuestMazeReviewCollector;
const getContributionScore = (rewarded, rejected) => {
    return rewarded * 10 - rejected * 3;
};
exports.getContributionScore = getContributionScore;
const selectMenuOptions = [
    { label: "Guild Quests", value: "guild_quest" },
    { label: "Guild Maze", value: "maze" },
];
const generateGquestsListEmbed = (client, interaction, gquestMazeArr, title, userID, type, systemType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const guild = yield client.guilds.fetch(interaction.guild.id);
        let user;
        if (userID.length)
            user = yield client.users.fetch(userID, { force: true });
        let page = 0;
        const pageSize = 3;
        const totalPages = Math.ceil(gquestMazeArr.length / pageSize);
        const getEmbed = (page, pageSize) => {
            const startIndex = page * pageSize;
            const endIndex = pageSize + startIndex;
            const slicedArr = gquestMazeArr.slice(startIndex, endIndex);
            const description = !slicedArr.length
                ? `${user ? user.displayName : "Guild'"} has no ${type} guild quests`
                : slicedArr
                    .map((ele, idx) => {
                    const submittedLine = `\n\n**${startIndex + idx + 1}. 🪪 ${systemType === "gquest" ? "Guild Quest" : "Guild Maze"} ID: \`${ele.messageID}\`\n**
**👤 Submitted by: **<@${ele.userID}>\n
** Submitted on: **<t:${Math.ceil(ele.submittedAt / 1000)}:F>`;
                    const rewardedLine = type === "rewarded"
                        ? `** Rewarded by: **<@${ele.reviewedBy}>
** Rewarded on: **<t:${Math.ceil(ele.rewardedAt / 1000)}:F>`
                        : "";
                    const rejectedLine = type === "rejected"
                        ? `** Rejected by: **<@${ele.reviewedBy}>
** Rejected on: **<t:${Math.ceil(ele.rejectedAt / 1000)}:F>
** Reason: **_${ele.rejectionReason}_`
                        : "";
                    const floors = `**Start Floor : **${ele.startFloor}\n**End Floor : **${ele.endFloor}\n`;
                    const arr = [submittedLine, rewardedLine, rejectedLine];
                    if (systemType === "maze") {
                        arr.push(floors);
                    }
                    return arr.filter(Boolean).join("\n");
                })
                    .join("\n");
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle(`${title}`)
                .setColor("Gold")
                .setDescription(description)
                .setFooter({
                text: `${guild.name} • Guild ${systemType === "gquest" ? "Quests" : "Mazes"}`,
                iconURL: "attachment://thumbnail.png",
            })
                .setTimestamp();
            return embed;
        };
        const initialEmbed = getEmbed(page, pageSize);
        const buttonsRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(`${type}_prev`)
            .setEmoji("⬅️")
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setDisabled(page <= 0), new discord_js_1.ButtonBuilder()
            .setCustomId(`${type}_next`)
            .setEmoji("➡️")
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setDisabled(page >= totalPages - 1));
        const channel = interaction.channel;
        if (!channel || channel.type !== discord_js_1.ChannelType.GuildText) {
            yield interaction.editReply({ content: "Invalid channel." });
            return;
        }
        yield interaction.editReply({ content: "generating list..." });
        const msg = yield channel.send({
            embeds: [initialEmbed],
            components: [buttonsRow],
            files: [thumbnail],
        });
        const collector = msg.createMessageComponentCollector({
            time: 60000 * 10, //10 minutes
            filter: (i) => [`${type}_prev`, `${type}_next`].includes(i.customId) &&
                i.user.id === interaction.user.id &&
                !i.user.bot,
        });
        collector.on("collect", (btnInt) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield btnInt.deferUpdate();
                if (btnInt.customId === `${type}_prev`)
                    page--;
                if (btnInt.customId === `${type}_next`)
                    page++;
                buttonsRow.components[0].setDisabled(page <= 0);
                buttonsRow.components[1].setDisabled(page >= totalPages - 1);
                const newEmbed = getEmbed(page, pageSize);
                yield msg.edit({
                    embeds: [newEmbed],
                    components: [buttonsRow],
                });
            }
            catch (err) {
                console.error("Error in collector :", err);
            }
        }));
        collector.on("end", (collected, reason) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                if (reason === "time") {
                    yield msg.edit({
                        content: "⏱️ Interaction timed out.",
                        components: [],
                    });
                }
            }
            catch (err) {
                console.error(err);
            }
        }));
    }
    catch (err) {
        console.error("Error generating gquests/mazes list embed : ", err);
    }
});
exports.generateGquestsListEmbed = generateGquestsListEmbed;
// give paginated leaderboard
const getGquestMazeLeaderboard = (client, users, guild, type, interaction, channel) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let page = 0;
        const pageSize = 10;
        const totalPages = Math.ceil(users.length / pageSize);
        // function that sorts and slices
        const getUsers = (page, type) => {
            const startIndex = page * pageSize;
            const endIndex = pageSize + startIndex;
            // sort based on type
            const sortedUsers = [...users].sort((a, b) => {
                const compParameter = (user) => {
                    const rewarded = type === "guild_quest"
                        ? user.gquests.rewarded
                        : user.mazes.rewarded;
                    const rejected = type === "guild_quest"
                        ? user.gquests.rejected
                        : user.mazes.rejected;
                    return (rewarded.length +
                        (0, exports.getContributionScore)(rewarded.length, rejected.length));
                };
                return compParameter(b) - compParameter(a);
            });
            return sortedUsers.slice(startIndex, endIndex).map((user, idx) => {
                const rewarded = type === "guild_quest" ? user.gquests.rewarded : user.mazes.rewarded;
                const rejected = type === "guild_quest" ? user.gquests.rejected : user.mazes.rejected;
                return {
                    userID: user.userID,
                    rank: startIndex + idx + 1,
                    completed: rewarded.length,
                    contribution_score: (0, exports.getContributionScore)(rewarded.length, rejected.length),
                };
            });
        };
        const usersArr = getUsers(page, type);
        const leaderboardImage = yield (0, generateGquestMazeLeaderboardImage_1.generateGquestMazeLeaderboardImage)(client, usersArr);
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle(`📊 ${guild.name} ${type
            .split("_")
            .map((word) => word.at(0).toUpperCase() + word.slice(1))
            .join(" ")} Leaderboard`)
            .setColor("Aqua")
            .setFooter({
            text: `${guild.name} ${type}`,
            iconURL: "attachment://thumbnail.png",
        })
            .setImage("attachment://leaderboard.png")
            .setTimestamp();
        const buttonsRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(`leaderboard_prev`)
            .setEmoji("⬅️")
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setDisabled(page <= 0), new discord_js_1.ButtonBuilder()
            .setCustomId(`leaderboard_next`)
            .setEmoji("➡️")
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setDisabled(page >= totalPages - 1));
        const selectMenuRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.StringSelectMenuBuilder()
            .setCustomId("leaderboard_select")
            .addOptions(selectMenuOptions.map((option) => {
            return new discord_js_1.StringSelectMenuOptionBuilder()
                .setLabel(option.label)
                .setValue(option.value)
                .setDefault(type === option.value);
        })));
        yield interaction.editReply({ content: "generating leaderboard." });
        const reply = yield channel.send({
            embeds: [embed],
            files: [leaderboardImage],
            components: [buttonsRow, selectMenuRow],
        });
        const collector = reply.createMessageComponentCollector({
            time: 60000 * 10,
            filter: (i) => ["leaderboard_prev", "leaderboard_select", "leaderboard_next"].includes(i.customId) &&
                i.user.id === interaction.user.id &&
                !i.user.bot,
        });
        collector.on("collect", (compInt) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                // if button interaction
                if (compInt.isButton()) {
                    yield compInt.deferUpdate();
                    if (compInt.customId === "leaderboard_prev")
                        page--;
                    if (compInt.customId === "leaderboard_next")
                        page++;
                    buttonsRow.components[0].setDisabled(page <= 0);
                    buttonsRow.components[1].setDisabled(page >= totalPages - 1);
                    const newUsers = getUsers(page, type);
                    // generate new image
                    const newLeaderboardImage = yield (0, generateGquestMazeLeaderboardImage_1.generateGquestMazeLeaderboardImage)(client, newUsers);
                    embed.setTitle(`📊 ${guild.name} ${type
                        .split("_")
                        .map((word) => word.at(0).toUpperCase() + word.slice(1))
                        .join(" ")} Leaderboard`);
                    yield reply.edit({
                        embeds: [embed],
                        components: [buttonsRow, selectMenuRow],
                        files: [newLeaderboardImage],
                    });
                }
                // if select menu interaction
                if (compInt.isStringSelectMenu()) {
                    yield compInt.deferUpdate();
                    page = 0;
                    type = compInt.values[0];
                    const newUsers = getUsers(page, type);
                    const leaderboardImage = yield (0, generateGquestMazeLeaderboardImage_1.generateGquestMazeLeaderboardImage)(client, newUsers);
                    embed.setTitle(`📊 ${guild.name} ${type
                        .split("_")
                        .map((word) => word.at(0).toUpperCase() + word.slice(1))
                        .join(" ")} Leaderboard`);
                    const newSelectMenuRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.StringSelectMenuBuilder()
                        .setCustomId("leaderboard_select")
                        .addOptions(selectMenuOptions.map((option) => {
                        return new discord_js_1.StringSelectMenuOptionBuilder()
                            .setLabel(option.label)
                            .setValue(option.value)
                            .setDefault(type === option.value);
                    })));
                    yield reply.edit({
                        embeds: [embed],
                        components: [buttonsRow, newSelectMenuRow],
                        files: [leaderboardImage],
                    });
                }
            }
            catch (err) {
                console.error("Error in guild quest/maze leaderboard collector : ", err);
            }
        }));
        collector.on("end", (collected, reason) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                if (reason === "time") {
                    yield interaction.editReply({
                        content: "⏱️ Interaction timed out.",
                        components: [],
                    });
                    return;
                }
            }
            catch (err) {
                console.error(err);
            }
        }));
    }
    catch (err) {
        console.error("Error generating guild quest or maze leaderboard : ", err);
    }
});
exports.getGquestMazeLeaderboard = getGquestMazeLeaderboard;
