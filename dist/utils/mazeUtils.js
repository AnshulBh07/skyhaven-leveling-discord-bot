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
exports.attachMazeThreadCollector = void 0;
const discord_js_1 = require("discord.js");
const mazeSchema_1 = __importDefault(require("../models/mazeSchema"));
const userSchema_1 = __importDefault(require("../models/userSchema"));
const helperArrays_1 = require("../data/helperArrays");
const gquestUtils_1 = require("./gquestUtils");
const permissionsCheck_1 = require("./permissionsCheck");
const thumbnail = new discord_js_1.AttachmentBuilder(helperArrays_1.leaderboardThumbnail).setName("thumbnail.png");
const attachMazeThreadCollector = (client, threadID) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // first we find the thread
        const maze = yield mazeSchema_1.default.findOne({ submissionThreadID: threadID });
        if (!maze)
            return;
        const guild = yield client.guilds.fetch(maze.serverID);
        const channel = yield guild.channels.fetch(maze.channelID, { force: true });
        if (!channel || channel.type !== discord_js_1.ChannelType.GuildText)
            return;
        let submissionThread = null;
        try {
            submissionThread = yield channel.threads.fetch(maze.submissionThreadID);
        }
        catch (err) {
            if (err.code === 10003) {
                console.warn(`Thread ${maze.submissionThreadID} was deleted or not found. Skipping collector attachment.`);
                return;
            }
            else {
                throw err;
            }
        }
        if (!submissionThread)
            return;
        let submissionsRequired = Math.round((maze.endFloor - maze.startFloor) / 100);
        // we will use a message collector not a component interaction collector
        // as user will send images as message attachments
        const collector = submissionThread.createMessageCollector({
            filter: (msg) => !msg.author.bot,
            time: 60000 * 60, //60 min
        });
        collector.on("collect", (msg) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const isSubmitter = String(msg.author.id) === String(maze.userID);
                const isAdmin = yield (0, permissionsCheck_1.isManager)(client, msg.author.id, guild.id, "mz");
                if (!isSubmitter && !isAdmin) {
                    yield submissionThread.send({
                        content: "❌ You do not have permission to chat in this thread.",
                    });
                    yield msg.delete();
                    return;
                }
                if (msg.content.length > 0) {
                    yield submissionThread.send({
                        content: "Please send the images only",
                    });
                    return;
                }
                // check if the message is valid or not
                const attachments = Array.from(msg.attachments.entries()).map(([_, attachment]) => attachment);
                // check valid submission
                if (attachments.length !== submissionsRequired ||
                    attachments.some((attachment) => attachment.contentType &&
                        !attachment.contentType.startsWith("image/"))) {
                    yield submissionThread.send({
                        content: "Invalid submission. Please try again.",
                    });
                    return;
                }
                yield submissionThread.send({
                    content: "Please wait while we process your submission.",
                });
                // valid attachments take their url in and save in db
                const imageUrls = attachments.map((attachment) => attachment.url);
                yield mazeSchema_1.default.findOneAndUpdate({ submissionThreadID: threadID }, { $set: { imageUrls: imageUrls } });
                yield submissionThread.send({ content: "Thanks for submissions." });
                // find user and update
                const user = yield userSchema_1.default.findOneAndUpdate({ userID: maze.userID }, {
                    $set: {
                        "mazes.lastSubmissionDate": new Date(),
                    },
                    $push: { "mazes.pending": maze._id },
                });
                if (!user) {
                    yield channel.send({ content: "No user found." });
                    return;
                }
                // create a submission embed
                const submissionEmbed = new discord_js_1.EmbedBuilder()
                    .setTitle("🧾 Guild Maze Submission")
                    .setDescription(`Thank you for your submission! 🔍\n` +
                    `Our team will review it shortly. If everything checks out, you’ll be rewarded soon. 🎉`)
                    .setColor("Aqua")
                    .addFields({
                    name: "\u200b",
                    value: `**📤 Submitted by : **<@${user.userID}>`,
                    inline: false,
                }, {
                    name: "\u200b",
                    value: `**Start Floor : **${maze.startFloor}`,
                    inline: false,
                }, {
                    name: "\u200b",
                    value: `**End Floor : **${maze.endFloor}`,
                    inline: false,
                }, {
                    name: "\u200b",
                    value: `**🕒 Submitted On : **<t:${Math.floor(Date.now() / 1000)}:F>`,
                }, {
                    name: "\u200b",
                    value: `**📌 Status : **${"Pending"}`,
                    inline: false,
                }, {
                    name: "👤 User Status",
                    value: `**Total Pending : **${user.mazes.pending.length + 1}\n**Total Rewarded : **${user.mazes.rewarded.length}`,
                    inline: false,
                })
                    .setFooter({
                    text: `${guild.name} Guild Mazes`,
                    iconURL: "attachment://thumbnail.png",
                })
                    .setTimestamp();
                const buttonsRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                    .setCustomId("reward")
                    .setEmoji("💵")
                    .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
                    .setCustomId("reject")
                    .setEmoji("❌")
                    .setStyle(discord_js_1.ButtonStyle.Secondary));
                // send message at channel
                const embedMessage = yield channel.send({
                    embeds: [submissionEmbed],
                    files: [thumbnail],
                });
                const finalMessage = yield channel.send({
                    files: [...imageUrls],
                    components: [buttonsRow],
                });
                // change message id to final id
                maze.messageID = finalMessage.id;
                maze.embedMessageID = embedMessage.id;
                yield maze.save();
                submissionEmbed.addFields({
                    name: "\u200b",
                    value: `**Maze ID : ** \`${embedMessage.id}\``,
                });
                yield embedMessage.edit({ embeds: [submissionEmbed] });
                // attach collectors to it
                yield (0, gquestUtils_1.attachQuestMazeReviewCollector)(client, maze, "mz");
                // delete thread
                yield submissionThread.delete();
            }
            catch (err) {
                console.error("Error in thread collector event : ", err);
            }
        }));
        // if the user does not submit any images within 60 min cancel submission
        collector.on("end", (collected, reason) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                if (reason === "time" && collected.size === 0) {
                    // delete the thread and send message at channel tagging user
                    yield submissionThread.delete("interaction time out.");
                    yield channel.send({
                        content: `Guild maze submission for <@${maze.userID}> has been rejected due to no image evidence provided.`,
                    });
                    return;
                }
                // if there is some submission but not enough
                if (reason === "title" && collected.size < submissionsRequired) {
                    yield submissionThread.delete("interaction time out.");
                    yield channel.send({
                        content: `Guild maze submission for <@${maze.userID}> has been rejected due to insufficient image evidence provided.`,
                    });
                    return;
                }
            }
            catch (err) {
                console.error("Error in maze thread collector end : ", err);
            }
        }));
    }
    catch (err) {
        console.error("Error attaching collector to maze threaded submission : ", err);
    }
});
exports.attachMazeThreadCollector = attachMazeThreadCollector;
