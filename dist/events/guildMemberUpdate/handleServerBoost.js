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
const configSchema_1 = __importDefault(require("../../models/configSchema"));
const helperArrays_1 = require("../../data/helperArrays");
// this file detects server boost from a user and sends a message
const execute = (client, oldMember, newMember) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // check for server boost
        if (!oldMember.premiumSince && newMember.premiumSince) {
            const guild = yield client.guilds.fetch({ guild: newMember.guild.id });
            const guildConfig = yield configSchema_1.default.findOne({
                serverID: newMember.guild.id,
            });
            if (!guildConfig)
                return;
            const { serverBoostChannelID } = guildConfig.moderationConfig;
            const { seraphinaMood } = guildConfig.moodConfig;
            const channel = yield guild.channels.fetch(serverBoostChannelID, {
                force: true,
            });
            if (!channel || channel.type !== discord_js_1.ChannelType.GuildText)
                return;
            const moodMessageArr = helperArrays_1.serverBoostMessages[seraphinaMood];
            if (!moodMessageArr.length)
                return;
            const message = moodMessageArr[Math.floor(Math.random() * moodMessageArr.length)].replace("userId", newMember.id);
            yield channel.send({ content: message });
        }
    }
    catch (err) {
        console.error("Error while detecting server boosts : ", err);
    }
});
exports.default = execute;
