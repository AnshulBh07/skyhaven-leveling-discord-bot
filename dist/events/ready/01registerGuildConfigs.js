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
const configSchema_1 = __importDefault(require("../../models/configSchema"));
const createNewUser_1 = require("../../utils/createNewUser");
const helperArrays_1 = require("../../data/helperArrays");
// if a certain guild config is not present in config we will create it
const execute = (client) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const guilds = Array.from(client.guilds.cache.entries()).map(([_, guild]) => guild);
        if (!guilds.length || !client.user)
            return;
        for (const guild of guilds) {
            const guildId = guild.id;
            const adminId = guild.ownerId;
            const existingGuild = yield configSchema_1.default.findOne({ serverID: guildId });
            const guild_members = Array.from(guild.members.cache.entries()).map(([_, member]) => member.user);
            if (existingGuild)
                continue;
            // create level roles
            const levelRolesConfig = yield Promise.all(helperArrays_1.levelRoles.map((levelRole) => __awaiter(void 0, void 0, void 0, function* () {
                // first check if the guild already has this particular role to avoid duplicate role creations
                const existingRole = guild.roles.cache.find((role) => role.name === levelRole.name);
                if (existingRole) {
                    console.log(`‼️ Role ${existingRole.name} already exists in guild ${guild.name}`);
                    const existingRoleFromArray = helperArrays_1.levelRoles.find((role) => role.name === existingRole.name);
                    return {
                        minLevel: (existingRoleFromArray === null || existingRoleFromArray === void 0 ? void 0 : existingRoleFromArray.minLevel) || 1,
                        maxLevel: (existingRoleFromArray === null || existingRoleFromArray === void 0 ? void 0 : existingRoleFromArray.maxLevel) || 5,
                        roleID: existingRole.id,
                    };
                }
                const newRole = yield guild.roles.create({
                    name: levelRole.name,
                    color: levelRole.color,
                    reason: `Auto-generated for leveling system level (${levelRole.minLevel}-${levelRole.maxLevel})`,
                });
                console.log(`✅ Role ${newRole.name} created for server ${guild.name}`);
                return {
                    minLevel: levelRole.minLevel,
                    maxLevel: levelRole.maxLevel,
                    roleID: newRole.id,
                };
            })));
            // create giveaway roles
            const giveawayRolesConfig = yield Promise.all(helperArrays_1.giveawayRoles.map((giveawayRole) => __awaiter(void 0, void 0, void 0, function* () {
                // first check if the role already exists in guild, should be case sensitive
                const existingRole = guild.roles.cache.find((role) => role.name === giveawayRole.name);
                // if already exists in guild
                if (existingRole) {
                    console.log(`‼️ Role ${existingRole.name} already exists in guild ${guild.name}`);
                    return { roleID: existingRole.id, name: existingRole.name };
                }
                // if doesn't exist create role
                const newRole = yield guild.roles.create({
                    name: giveawayRole.name,
                    color: giveawayRole.color,
                    reason: `Auto-generated for Giveaway system`,
                });
                console.log(`✅ Role ${newRole.name} created for server ${guild.name}`);
                return { roleID: newRole.id, name: newRole.name };
            })));
            const configOptions = {
                serverID: guildId,
                botID: client.user.id,
                levelConfig: {
                    levelRoles: levelRolesConfig,
                    managerRoles: [],
                    notificationChannelID: "",
                    blacklistedChannels: [],
                    ignoredChannels: [],
                    xpCooldown: 5000,
                    xpFromAttachments: true,
                    xpFromEmbeds: true,
                    xpFromEmojis: true,
                    xpFromReactions: true,
                    xpFromStickers: true,
                    xpFromText: true,
                    xpFromVoice: true,
                },
                moderationConfig: {
                    botAdminIDs: [adminId],
                    welcomeChannelID: "",
                    welcomeMessage: "",
                    farewellMessage: "",
                    farewellChannelID: "",
                    serverBoostChannelID: "",
                },
                giveawayConfig: {
                    giveawayRole: "",
                    managerRoles: [],
                    banList: [],
                    giveawayChannelID: "",
                    roles: giveawayRolesConfig,
                },
                gquestMazeConfig: {
                    mazeChannelID: "",
                    gquestChannelID: "",
                    gquestRole: "",
                    mazeRole: "",
                    managerRoles: [],
                    gquestRewardAmount: 0,
                    mazeRewardAmount: 0,
                },
                raidConfig: {
                    raidChannelID: "",
                    raidRole: "",
                    participantRole: "",
                    raidDay: 5,
                    raidTime: "22:30",
                    managerRoles: [],
                    tankEmojiID: "",
                    dpsEmojiID: "",
                    supportEmojiID: "",
                    banList: [],
                },
                communitySupportConfig: {
                    mentionRoles: [],
                    managerRoles: [],
                    supportChannelID: "",
                    banList: [],
                },
                moodConfig: {
                    seraphinaMood: "serene",
                },
                bannedUsers: [],
                kickedUsers: [],
                users: [],
            };
            const newConfig = new configSchema_1.default(configOptions);
            yield newConfig.save();
            // register fresh user for all guild members
            for (const member of guild_members) {
                // no bots to register as roles
                if (!member.bot)
                    yield (0, createNewUser_1.createNewUser)(client, guildId, member.id, true);
            }
            console.log(`☑️ Server ${guild.name} added to configs.`);
        }
    }
    catch (err) {
        console.error(err);
    }
});
exports.default = execute;
