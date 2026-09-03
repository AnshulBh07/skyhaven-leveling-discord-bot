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
exports.createNewUser = void 0;
const configSchema_1 = __importDefault(require("../models/configSchema"));
const userSchema_1 = __importDefault(require("../models/userSchema"));
const createNewUser = (client_1, guildID_1, userID_1, ...args_1) => __awaiter(void 0, [client_1, guildID_1, userID_1, ...args_1], void 0, function* (client, guildID, userID, initialConfig = false) {
    try {
        const guildConfig = yield configSchema_1.default.findOne({ serverID: guildID }).populate({
            path: "users",
        });
        if (!guildConfig)
            return;
        const { levelConfig } = guildConfig;
        const usersArr = guildConfig.users;
        const userInGuildConfig = usersArr.some((user) => user.userID === userID);
        const basicRole = levelConfig.levelRoles.find((role) => role.minLevel === 1);
        if (!basicRole)
            return;
        // get user info
        const guild = yield client.guilds.fetch({ guild: guildID, force: true });
        if (!guild)
            return;
        const member = yield guild.members.fetch(userID);
        // remove all related member roles if they have any
        const allRelatedLevelRoles = levelConfig.levelRoles.map((role) => role.roleID);
        // all current roles with member
        const allCurrRoles = member.roles.cache.map((role) => role.id);
        for (const role of allCurrRoles) {
            if (allRelatedLevelRoles.includes(role))
                yield member.roles.remove(role, "to create a new user");
        }
        // add new role
        yield member.roles.add(basicRole.roleID);
        const options = {
            userID: userID,
            username: member.user.username,
            nickname: member.nickname || member.user.username,
            serverID: guildID,
            leveling: {
                xp: 0,
                totalXp: 0,
                voiceXp: 0,
                xpPerDay: new Map(),
                level: 1,
                textXp: 0,
                lastMessageTimestamp: new Date(),
                lastPromotionTimestamp: new Date(),
                currentRole: basicRole.roleID,
            },
            giveaways: {
                isBanned: false,
                giveawaysEntries: [],
                giveawaysWon: [],
            },
            gquests: {
                dmNotif: true,
                pending: [],
                rejected: [],
                rewarded: [],
                lastRejectionDate: null,
                lastRewardDate: null,
                lastSubmissionDate: null,
                totalRewarded: 0,
            },
            mazes: {
                dmNotif: true,
                pending: [],
                rejected: [],
                rewarded: [],
                lastRejectionDate: null,
                lastRewardDate: null,
                lastSubmissionDate: null,
                totalRewarded: 0,
            },
            raids: {
                dmNotif: true,
                completed: [],
                noShows: [],
                reliability: 0,
            },
        };
        if (userInGuildConfig) {
            // if user is already in guildconfig find and reset the user in users model
            if (!initialConfig)
                yield userSchema_1.default.findOneAndUpdate({ userID: userID, serverID: guild.id }, { $set: options });
        }
        else {
            // if the user is in user schema but not in guild
            const user = yield userSchema_1.default.findOne({ userID: userID, serverID: guild.id });
            if (user) {
                yield configSchema_1.default.findOneAndUpdate({ serverID: guildID }, { $push: { users: user._id } });
            }
            else {
                const newUser = yield userSchema_1.default.create(options);
                //   put user id in guild config
                yield configSchema_1.default.findOneAndUpdate({ serverID: guildID }, { $push: { users: newUser._id } });
            }
        }
    }
    catch (err) {
        console.error("Error in create new user function : ", err);
    }
});
exports.createNewUser = createNewUser;
