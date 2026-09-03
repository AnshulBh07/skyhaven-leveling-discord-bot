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
exports.demoteUser = void 0;
const helperArrays_1 = require("../data/helperArrays");
const demoteUser = (client, user, levelRoles, finalLevel, targetUser, guildID) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let isDemoted = false, demotionMessage = "";
    // compare role ids to check for role demotion as well
    const prevRoleID = user.leveling.currentRole;
    const newRoleID = (_a = levelRoles.find((role) => role.minLevel <= finalLevel && role.maxLevel >= finalLevel)) === null || _a === void 0 ? void 0 : _a.roleID;
    if (!newRoleID)
        return { isDemoted: isDemoted, demotionMessage: demotionMessage };
    // fetch guild and member data
    const guild = yield client.guilds.fetch(guildID);
    const guild_member = yield guild.members.fetch(targetUser.id);
    // demotion occured
    if (prevRoleID !== newRoleID) {
        isDemoted = true;
        // check if the guild has the new role
        const newRole = guild.roles.cache.find((role) => role.id === newRoleID);
        const oldRole = guild.roles.cache.find((role) => role.id === prevRoleID);
        if (!newRole || !oldRole)
            return { isDemoted: isDemoted, demotionMessage: demotionMessage };
        const allRelatedRoles = levelRoles.map((role) => role.roleID);
        const memberRoles = guild_member.roles.cache.map((role) => role.id);
        for (const role of allRelatedRoles) {
            if (memberRoles.includes(role))
                yield guild_member.roles.remove(role);
        }
        yield guild_member.roles.add(newRoleID);
        user.leveling.currentRole = newRoleID;
        demotionMessage = helperArrays_1.roleDemotionMessages[Math.floor(Math.random() * helperArrays_1.roleDemotionMessages.length)]
            .replace("{user}", `<@${targetUser.id}>`)
            .replace("{oldRole}", `${oldRole.name}`)
            .replace("{newRole}", `${newRole.name}`);
    }
    user.leveling.xp = 0;
    user.leveling.level = finalLevel;
    return { isDemoted: isDemoted, demotionMessage: demotionMessage };
});
exports.demoteUser = demoteUser;
