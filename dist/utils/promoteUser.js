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
exports.promoteUser = void 0;
const generateSeraphinaRankUpMessage_1 = require("./LLMUtils/generateSeraphinaRankUpMessage");
const configSchema_1 = __importDefault(require("../models/configSchema"));
const promoteUser = (client, user, levelRoles, finalLevel, targetUser, guildID) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // check if a role update has occured
    const prevRoleID = user.leveling.currentRole;
    // get new Role id
    const newRole = levelRoles.find((role) => role.minLevel <= finalLevel && role.maxLevel >= finalLevel);
    const newRoleID = (_a = newRole === null || newRole === void 0 ? void 0 : newRole.roleID) !== null && _a !== void 0 ? _a : prevRoleID;
    // fetch guild and member data
    const guild = yield client.guilds.fetch(guildID);
    const guild_member = yield guild.members.fetch(targetUser.id);
    let isPromoted = false;
    let promotionMessage = "";
    const guildConfig = yield configSchema_1.default.findOne({ serverID: guildID });
    if (!guildConfig)
        return { isPromoted: isPromoted, promotionMessage: promotionMessage };
    const { seraphinaMood } = guildConfig.moodConfig;
    if (prevRoleID !== newRoleID) {
        // new role acquired
        isPromoted = true;
        const role = guild.roles.cache.find((role) => role.id === newRoleID);
        if (!role)
            return { isPromoted: isPromoted, promotionMessage: promotionMessage };
        const allRelatedRoles = levelRoles.map((role) => role.roleID); //all the roles from bot
        const memberRoles = guild_member.roles.cache.map((role) => role.id);
        // delete all prev roles
        for (const role of allRelatedRoles) {
            if (memberRoles.includes(role))
                yield guild_member.roles.remove(role);
        }
        // add new role
        yield guild_member.roles.add(newRoleID);
        user.leveling.currentRole = newRoleID;
        promotionMessage = yield (0, generateSeraphinaRankUpMessage_1.generateSeraphinaRankUpMessage)(seraphinaMood, role.name, user.userID);
        promotionMessage = promotionMessage
            .replace("<@&{roleID}>", `**${role.name}**`)
            .replace("{userID}", user.userID);
    }
    user.leveling.xp = 0;
    user.leveling.level = finalLevel;
    return { isPromoted: isPromoted, promotionMessage: promotionMessage };
});
exports.promoteUser = promoteUser;
