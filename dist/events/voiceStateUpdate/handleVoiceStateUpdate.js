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
const userSchema_1 = __importDefault(require("../../models/userSchema"));
const getDateString_1 = require("../../utils/getDateString");
const getLevelFromXp_1 = require("../../utils/getLevelFromXp");
const generateLvlNotif_1 = require("../../utils/generateLvlNotif");
const configSchema_1 = __importDefault(require("../../models/configSchema"));
// a map that keep tracks of when a user has started VC, will be used to calulate total VC time for user
// time is stored in unix epoch for uniformity
const voiceSessions = new Map();
const getEligibility = (state) => {
    const channel = state.channel;
    if (!channel)
        return false;
    // number of members on channel, filter bots
    const members = channel.members.filter((member) => !member.user.bot);
    return (!state.selfMute &&
        !state.selfDeaf &&
        members.size > 1 &&
        !state.serverDeaf &&
        !state.serverMute);
};
// function that grants xp for user
const grantXp = (client, voiceState, userID, joinedAt) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const now = Date.now();
        // convert the time spent in minutes as we will give 3 xp per minute
        const timeSpentOnVC = (now - joinedAt) / 60000;
        const xpGain = Math.floor(timeSpentOnVC * 5);
        // get current date string in YYY-MM-DD format
        const dateStr = (0, getDateString_1.getDateString)(new Date());
        const user = yield userSchema_1.default.findOne({
            userID: userID,
            serverID: voiceState.guild.id,
        });
        if (!user)
            return;
        user.leveling.voiceXp += xpGain;
        user.leveling.totalXp += xpGain;
        user.leveling.xpPerDay.set(dateStr, (user.leveling.xpPerDay.get(dateStr) || 0) + xpGain);
        //check for level up after granting xp
        const prevLevel = user.leveling.level;
        const finalLevel = (0, getLevelFromXp_1.getLvlFromXP)(user.leveling.totalXp);
        if (prevLevel !== finalLevel) {
            const guildID = voiceState.guild.id;
            const guildConfig = yield configSchema_1.default.findOne({ serverID: guildID });
            if (!guildConfig)
                return;
            const { levelRoles, notificationChannelID } = guildConfig.levelConfig;
            const lvlRolesArr = levelRoles.map((role) => {
                return {
                    roleID: role.roleID,
                    minLevel: role.minLevel,
                    maxLevel: role.maxLevel,
                };
            });
            const notifChannel = voiceState.guild.channels.cache.find((channel) => channel.id === notificationChannelID);
            const targetUser = yield client.users.fetch(userID);
            yield (0, generateLvlNotif_1.generateLvlNotif)(client, user, targetUser, prevLevel, finalLevel, lvlRolesArr, notifChannel, guildID);
        }
        // update user finally
        yield user.save();
    }
    catch (err) {
        console.error(err);
    }
});
// this file handles voice state update and updates xp from voice
const execute = (client, oldState, newState) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = newState.id;
        const guild = newState.guild;
        const wasEligible = getEligibility(oldState);
        const nowEligible = getEligibility(newState);
        const switchedChannels = oldState.channelId &&
            newState.channelId &&
            oldState.channelId !== newState.channelId;
        const guildConfig = yield configSchema_1.default.findOne({ serverID: guild.id });
        if (!guildConfig)
            return;
        const { xpFromVoice } = guildConfig.levelConfig;
        // There are several cases we may encounter
        // 1. user just joined a vc
        if (!wasEligible && nowEligible) {
            // set the map for user
            voiceSessions.set(userId, Date.now());
        }
        // 2. user switched channels
        if (wasEligible && nowEligible && switchedChannels) {
            // here we will end the prev session, add that xp and start a new session
            const joinedAt = voiceSessions.get(userId);
            if (joinedAt) {
                if (xpFromVoice)
                    yield grantXp(client, oldState, userId, joinedAt);
                voiceSessions.delete(userId);
            }
            voiceSessions.set(userId, Date.now());
            // return to avoid running of other conditions
            return;
        }
        // 3. lost eligibility (left, muted, alone, etc)
        if ((wasEligible && !nowEligible) ||
            (!newState.channelId && voiceSessions.has(userId))) {
            const joinedAt = voiceSessions.get(userId);
            if (joinedAt) {
                if (xpFromVoice)
                    yield grantXp(client, oldState, userId, joinedAt);
                voiceSessions.delete(userId);
            }
        }
    }
    catch (err) {
        console.error(err);
    }
});
exports.default = execute;
