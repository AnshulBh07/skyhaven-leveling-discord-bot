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
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const configCache_1 = require("../../utils/configCache");
const toramKnowledgeQueryUtils_1 = require("../../utils/toramKnowledgeQueryUtils");
const generateToramKnowledgeReply_1 = require("../../utils/LLMUtils/generateToramKnowledgeReply");
const execute = (client, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const channel = message.channel;
        const msg = message.content;
        const guild = message.guild;
        if (!msg.startsWith("t!") && !msg.startsWith("T!"))
            return;
        if (!guild || !channel || channel.type !== discord_js_1.ChannelType.GuildText)
            return;
        const guildConfig = yield (0, configCache_1.getCachedGuildConfig)(guild.id);
        if (!guildConfig)
            return;
        const { moodConfig } = guildConfig;
        const { seraphinaMood } = moodConfig;
        const query = msg.slice(2).trim();
        // find which file is needed
        const normalizedMsg = query.toLowerCase().replace(/[^\w\s/]/g, "");
        const file = (0, toramKnowledgeQueryUtils_1.matchPDFFile)(normalizedMsg);
        const reply = yield (0, generateToramKnowledgeReply_1.generateToramReply)(message.author.id, seraphinaMood, query, file);
        yield channel.send({ content: reply });
    }
    catch (err) {
        console.error("Error in toram query event : ", err);
    }
});
exports.default = execute;
