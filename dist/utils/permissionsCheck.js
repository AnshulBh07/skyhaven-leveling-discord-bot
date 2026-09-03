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
exports.isUser = exports.isManager = void 0;
const configSchema_1 = __importDefault(require("../models/configSchema"));
// for admin/manager only commands
const isManager = (client, userID, guildID, type) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const guildConfig = yield configSchema_1.default.findOne({ serverID: guildID });
        if (!guildConfig)
            return false;
        const { raidConfig, gquestMazeConfig, giveawayConfig, levelConfig, communitySupportConfig, } = guildConfig;
        const getManagerRoles = () => {
            switch (type) {
                case "gq":
                    return gquestMazeConfig.managerRoles;
                case "mz":
                    return gquestMazeConfig.managerRoles;
                case "ga":
                    return giveawayConfig.managerRoles;
                case "cs":
                    console.log("hit community support manager roles");
                    console.log(communitySupportConfig.managerRoles);
                    return communitySupportConfig.managerRoles;
                case "lvl":
                    return levelConfig.managerRoles;
                case "raid":
                    return raidConfig.managerRoles;
                default:
                    return new Array();
            }
        };
        const managerRoles = getManagerRoles();
        const guild = yield client.guilds.fetch({ guild: guildID, force: true });
        const member = yield guild.members.fetch({ user: userID, force: true });
        const member_roles = Array.from(member.roles.cache.entries()).map(([_, role]) => role.id);
        for (const role of managerRoles) {
            if (member_roles.includes(role))
                return true;
        }
        return false;
    }
    catch (err) {
        console.error("Error in isManager function");
        return false;
    }
});
exports.isManager = isManager;
// for user commands
const isUser = (client, userID, guildID, type) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const guildConfig = yield configSchema_1.default.findOne({ serverID: guildID });
        if (!guildConfig)
            return false;
        const { raidConfig, gquestMazeConfig, giveawayConfig } = guildConfig;
        const getRequiredRole = () => {
            switch (type) {
                case "gq":
                    return gquestMazeConfig.gquestRole;
                case "mz":
                    return gquestMazeConfig.mazeRole;
                case "ga":
                    return giveawayConfig.giveawayRole;
                case "raid":
                    return raidConfig.raidRole;
                default:
                    return "";
            }
        };
        const requiredRole = getRequiredRole();
        if (!requiredRole.length)
            return true;
        const guild = yield client.guilds.fetch({ guild: guildID, force: true });
        const member = yield guild.members.fetch({ user: userID, force: true });
        const member_roles = Array.from(member.roles.cache.entries()).map(([_, role]) => role.id);
        return member_roles.includes(requiredRole);
    }
    catch (err) {
        console.error("Error in isUser function");
        return false;
    }
});
exports.isUser = isUser;
