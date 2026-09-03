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
const configCache_1 = require("../../utils/configCache");
const countEmojis_1 = require("../../utils/countEmojis");
const userSchema_1 = __importDefault(require("../../models/userSchema"));
const createNewUser_1 = require("../../utils/createNewUser");
const getLevelFromXp_1 = require("../../utils/getLevelFromXp");
const generateLvlNotif_1 = require("../../utils/generateLvlNotif");
const getDateString_1 = require("../../utils/getDateString");
const execute = (client, message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const guildID = message.guildId;
        if (!guildID)
            return;
        const guildConfig = yield (0, configCache_1.getCachedGuildConfig)(guildID);
        if (!guildConfig)
            return;
        const { ignoredChannels, notificationChannelID, xpCooldown, levelRoles, xpFromAttachments, xpFromEmbeds, xpFromEmojis, xpFromStickers, xpFromText, } = guildConfig.levelConfig;
        // check for restrictions
        if (message.author.bot ||
            message.content.startsWith("/") ||
            message.content.startsWith("s!") ||
            message.content.startsWith("t!") ||
            message.content.startsWith("S!") ||
            message.content.startsWith("T!") ||
            ignoredChannels.includes(message.channel.id) ||
            !message.channel.isTextBased() ||
            message.channel.isThread())
            return;
        const hasText = message.content.length > 0;
        // images and gifs are sent as attachments from local machine
        // gifs can also be sent as embeds
        const hasImagesOrGifs = message.attachments.some((attachment) => {
            var _a, _b;
            return ((_a = attachment.contentType) === null || _a === void 0 ? void 0 : _a.startsWith("image/")) ||
                ((_b = attachment.contentType) === null || _b === void 0 ? void 0 : _b.startsWith(".gif"));
        }) || message.embeds.some((embed) => { var _a; return (_a = embed.data.type) === null || _a === void 0 ? void 0 : _a.startsWith("gif"); });
        const hasVideo = message.attachments.some((attachment) => { var _a; return (_a = attachment.contentType) === null || _a === void 0 ? void 0 : _a.startsWith("video"); }) || message.embeds.some((embed) => { var _a; return (_a = embed.data.type) === null || _a === void 0 ? void 0 : _a.startsWith("video"); });
        const hasEmojis = (0, countEmojis_1.countEmojis)(message.content) > 0;
        const hasStickers = message.stickers.size > 0;
        // if message does not exist in userstates make one
        let user = yield userSchema_1.default.findOne({
            userID: message.author.id,
            serverID: guildID,
        });
        if (!user) {
            yield (0, createNewUser_1.createNewUser)(client, guildID, message.author.id);
            return;
        }
        // check whether user is on cooldown or not
        const currTime = new Date().getTime();
        const cooldownExpTime = user.leveling.lastMessageTimestamp.getTime() + xpCooldown;
        if (currTime < cooldownExpTime)
            return;
        // generate xp for user and check level upgrade
        const msgLength = message.content.length - (0, countEmojis_1.countEmojis)(message.content);
        const xpGain = Math.min(Math.max(5, Math.floor(msgLength / 9)), 1000);
        const totalXpGainFromMessage = (hasText && xpFromText ? xpGain : 0) +
            (hasEmojis && xpFromEmojis ? (0, countEmojis_1.countEmojis)(message.content) * 2 : 0) +
            (hasImagesOrGifs && (xpFromAttachments || xpFromEmbeds) ? 5 : 0) +
            (hasVideo && (xpFromAttachments || xpFromEmbeds) ? 10 : 0) +
            (hasStickers && xpFromStickers ? 10 : 0);
        const prevLevel = user.leveling.level;
        const finalLevel = (0, getLevelFromXp_1.getLvlFromXP)(user.leveling.totalXp + totalXpGainFromMessage);
        user.leveling.totalXp += totalXpGainFromMessage;
        user.leveling.textXp += totalXpGainFromMessage;
        const dateStr = (0, getDateString_1.getDateString)(new Date());
        user.leveling.xpPerDay.set(dateStr, (user.leveling.xpPerDay.get(dateStr) || 0) + totalXpGainFromMessage);
        user.nickname =
            (_c = (_b = (_a = message.guild) === null || _a === void 0 ? void 0 : _a.members.cache.find((guild_member) => guild_member.id === message.author.id)) === null || _b === void 0 ? void 0 : _b.nickname) !== null && _c !== void 0 ? _c : user.username;
        const lvlRolesArr = levelRoles.map((role) => {
            return {
                roleID: role.roleID,
                minLevel: role.minLevel,
                maxLevel: role.maxLevel,
            };
        });
        const notifChannel = (_d = message.guild) === null || _d === void 0 ? void 0 : _d.channels.cache.find((channel) => channel.id === notificationChannelID);
        // perform a level up if different levels
        if (prevLevel !== finalLevel)
            yield (0, generateLvlNotif_1.generateLvlNotif)(client, user, message.author, prevLevel, finalLevel, lvlRolesArr, notifChannel, guildID);
        else {
            // no level up but we still have to update user
            user.leveling.xp += totalXpGainFromMessage;
            user.leveling.lastMessageTimestamp = new Date();
        }
        yield user.save();
    }
    catch (err) {
        console.error(err);
    }
});
exports.default = execute;
