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
const configCache_1 = require("../../utils/configCache");
const generateSeraphinaConvoReply_1 = require("../../utils/LLMUtils/generateSeraphinaConvoReply");
const commandKnowledgeBaseUtils_1 = require("../../utils/commandKnowledgeBaseUtils");
const generateCommandQueryReply_1 = require("../../utils/LLMUtils/generateCommandQueryReply");
const seraphinaImageAnalysis_1 = require("../../utils/LLMUtils/seraphinaImageAnalysis");
const chatMemorySchema_1 = __importDefault(require("../../models/chatMemorySchema"));
const retrieveMemories_1 = require("../../cognition/vector/retrieveMemories");
const cognitionQueue_1 = require("../../cognition/queues.ts/cognitionQueue");
// Flow for cognition and reply is given below, we try to simulate human thinking
// message
// ↓
// detect type
// ↓
// retrieve memories (so that new reply has knowledge of older one too)
// ↓
// generate reply
// ↓
// send reply
// ↓
// run cognition pipeline using a queueud worker
const execute = (client, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const guild = message.guild;
        const channel = message.channel;
        const msg = message.content;
        if (!guild ||
            !channel ||
            channel.type != discord_js_1.ChannelType.GuildText ||
            !message.content.length)
            return;
        if (!msg.startsWith("s!") && !msg.startsWith("S!"))
            return;
        const guildConfig = yield (0, configCache_1.getCachedGuildConfig)(guild.id);
        if (!guildConfig)
            return;
        const { seraphinaMood } = guildConfig.moodConfig;
        const userMsg = msg.slice(2).trim();
        // console.log("Seraphina mood is : ", seraphinaMood);
        // check if the message has images alongside content
        const msg_attachments = Array.from(message.attachments.entries()).map(([_, atch]) => atch);
        // message contains an image, user is most likely asking for an analysis so do it
        if (msg_attachments.length &&
            msg_attachments.every((attachment) => { var _a; return (_a = attachment.contentType) === null || _a === void 0 ? void 0 : _a.includes("image/"); })) {
            // send only the first image
            const imageAnalysisResult = yield (0, seraphinaImageAnalysis_1.seraphinaAnalyzeImage)(message.author.id, msg_attachments[0], userMsg, seraphinaMood);
            yield channel.send({ content: imageAnalysisResult });
            return;
        }
        // first check if it is a command query, if so generate a command query reply
        if ((0, commandKnowledgeBaseUtils_1.getIntentScore)(userMsg) > 5) {
            // get command
            const normalizedMsg = userMsg.toLowerCase().replace(/[^\w\s/]/g, "");
            const command = (0, commandKnowledgeBaseUtils_1.matchCommand)(normalizedMsg);
            if (!command) {
                yield channel.send({
                    content: "Hmm… I’m not sure which command that was about. Can you rephrase it?",
                });
                return;
            }
            const commandReply = yield (0, generateCommandQueryReply_1.generateCommandQueryReply)(userMsg, command, seraphinaMood, message.author.id);
            yield channel.send({ content: commandReply });
            return;
        }
        // run cognition pipeline, pass current user message and old seraphina reply
        // retrieve from last message chat memories (bound to be from seraphina)
        let interaction = "", pastMemories = "";
        const userChats = (yield chatMemorySchema_1.default.findOne({
            userID: message.author.id,
        }));
        if (userChats) {
            const chats = userChats.messages;
            if (chats.length > 0 &&
                chats[chats.length - 1].role === "model" &&
                chats[chats.length - 1].content.length > 0) {
                // form interaction that contains last seraphina message + current user message
                interaction = `Previous Seraphina reply : ${chats[chats.length - 1].content}
				Current ${message.author.displayName} message : ${userMsg}`;
            }
        }
        if (!interaction.length) {
            interaction = `
			Current ${message.author.displayName} message:
			${userMsg}
			`;
        }
        // parallelize memory retrieval and discord channel history fetch
        const [pastMemoriesResult, recentMsgs] = yield Promise.all([
            (0, retrieveMemories_1.retriveRelatedMemories)(interaction, message.author.id).catch((err) => {
                console.error("Memory retrieval failed : ", err);
                return "";
            }),
            channel.messages.fetch({ limit: 20 }),
        ]);
        pastMemories = pastMemoriesResult;
        const channelContext = recentMsgs
            .reverse()
            .map((msg) => {
            var _a;
            const speaker = msg.author.bot
                ? "Seraphina"
                : ((_a = msg.member) === null || _a === void 0 ? void 0 : _a.displayName) || msg.author.username;
            return `${speaker} : ${msg.content.replace(/^s!/i, "")}`;
        })
            .join("\n");
        // generate normal reply with convo prompt, reusing existing ChatMemory doc
        const seraphinaReply = yield (0, generateSeraphinaConvoReply_1.generateSeraphinaConvoReply)(seraphinaMood, message.author.id, userMsg, pastMemories, channelContext, userChats);
        yield channel.send({ content: seraphinaReply });
        if (cognitionQueue_1.CognitionQueue.length >= 100) {
            console.warn("Cognition queue full, dropping job");
            return;
        }
        // push cognition in queue
        cognitionQueue_1.CognitionQueue.push({
            id: crypto.randomUUID(),
            userId: message.author.id,
            interaction: interaction,
            createdAt: Date.now(),
        });
    }
    catch (err) {
        console.error("Error while talking to seraphina :", err);
    }
});
exports.default = execute;
