"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// this is the config for a guild accessed by main bot
// each supposed minibot is represented as a new sub subsystem for core bot
// therefore contains config for each system
const mongoose_1 = __importDefault(require("mongoose"));
const configCache_1 = require("../utils/configCache");
const Schema = mongoose_1.default.Schema;
const LevelRolesSchema = new Schema({
    minLevel: { type: Number, required: true },
    maxLevel: { type: Number, required: true },
    roleID: { type: String, required: true },
}, { timestamps: false, _id: false, _v: false });
const GiveawayRolesSchema = new Schema({
    roleID: { type: String, required: true, default: "" },
    name: { type: String, required: true, default: "" },
}, { timestamps: false, _id: false, _v: false });
const BanSchema = new Schema({
    userID: { type: String, required: true, default: "" },
    reason: { type: String, default: "" },
    banDate: { type: Date, required: true, default: Date.now },
    banBy: { type: String, required: true, default: "" }, //user who banned, stores user id
}, { timestamps: false, _id: false, _v: false });
const KickSchema = new Schema({
    userID: { type: String, required: true, default: "" },
    reason: { type: String, default: "" },
    kickDate: { type: Date, required: true, default: Date.now },
    kickBy: { type: String, required: true, default: "" }, //user who banned, stores user id
}, { timestamps: false, _id: false, _v: false });
const LevelingConfig = new Schema({
    levelRoles: { type: [LevelRolesSchema], default: [] },
    managerRoles: { type: [String], required: true, default: [] },
    notificationChannelID: { type: String, default: "" },
    blacklistedChannels: { type: [String], default: [] }, //bot cannot be operated in these channels
    ignoredChannels: { type: [String], default: [] }, //bot ignores xp gain from these channels
    xpCooldown: { type: Number, default: 5000 },
    xpFromEmojis: { type: Boolean, default: true },
    xpFromReactions: { type: Boolean, default: true },
    xpFromText: { type: Boolean, default: true },
    xpFromAttachments: { type: Boolean, default: true },
    xpFromEmbeds: { type: Boolean, default: true },
    xpFromStickers: { type: Boolean, default: true },
    xpFromVoice: { type: Boolean, default: true },
}, { timestamps: false, _id: false, _v: false });
const ModerationConfig = new Schema({
    welcomeMessage: { type: String, default: "" },
    welcomeChannelID: { type: String, default: "" },
    farewellChannelID: { type: String, default: "" },
    farewellMessage: { type: String, default: "" },
    serverBoostChannelID: { type: String, default: "" },
    banChannelID: { type: String, default: "" },
    kickChannelID: { type: String, default: "" },
    botAdminIDs: { type: [String], required: true, default: [] }, //can perform bot configuration
}, { timestamps: false, _id: false, _v: false });
const GiveawayConfig = new Schema({
    roles: { type: [GiveawayRolesSchema], default: [] },
    giveawayRole: { type: String, default: "" },
    managerRoles: { type: [String], default: [] },
    giveawayChannelID: { type: String, default: "" },
    banList: { type: [BanSchema], default: [] },
}, { timestamps: false, _id: false, _v: false });
// config for support/aid related commands
const CommunitySupportConfig = new Schema({
    mentionRoles: { type: [String], default: [] },
    managerRoles: { type: [String], default: [] },
    supportChannelID: { type: String, default: "" },
    banList: { type: [BanSchema], default: [] },
}, { timestamps: false, _id: false, _v: false });
const GquestMazeConfig = new Schema({
    mazeChannelID: { type: String, default: "" },
    gquestChannelID: { type: String, default: "" },
    gquestRole: { type: String, default: "" },
    mazeRole: { type: String, default: "" },
    managerRoles: { type: [String], default: [] },
    gquestRewardAmount: { type: Number, default: 0 },
    mazeRewardAmount: { type: Number, default: 0 },
}, { timestamps: false, _id: false, _v: false });
const RaidConfig = new Schema({
    raidChannelID: { type: String, default: "" },
    raidRole: { type: String, default: "" },
    participantRole: { type: String, default: "" },
    raidDay: { type: Number, default: 5 }, //defaults to saturday
    raidTime: { type: String, default: "22:30" }, //raid time in jst
    managerRoles: { type: [String], default: [] },
    banList: { type: [BanSchema], default: [] },
    tankEmojiID: { type: String, default: "" },
    dpsEmojiID: { type: String, default: "" },
    supportEmojiID: { type: String, default: "" },
}, { timestamps: false, _id: false, _v: false });
const MoodSchema = new Schema({
    seraphinaMood: {
        type: String,
        enum: [
            "serene",
            "tsundere",
            "tired",
            "divinePride",
            "cheerful",
            "cold",
            "dreamy",
            "gentle",
            "gloomy",
            "manic",
            "melancholy",
            "mischievous",
            "playful",
            "righteous",
            "flirtatious",
            "watchful",
            "merciful",
            "divine",
            "prophetic",
        ],
        required: true,
        default: "serene",
    },
}, { timestamps: true, _id: false, _v: false });
const ConfigSchema = new Schema({
    serverID: { type: String, required: true, unique: true, default: "" },
    botID: { type: String, required: true, default: "" },
    devsIDs: {
        type: [String],
        required: true,
        default: ["419373088614907904"],
    },
    levelConfig: { type: LevelingConfig, required: true },
    moderationConfig: { type: ModerationConfig, required: true },
    giveawayConfig: { type: GiveawayConfig, required: true },
    gquestMazeConfig: { type: GquestMazeConfig, required: true },
    raidConfig: { type: RaidConfig, required: true },
    communitySupportConfig: { type: CommunitySupportConfig, required: true },
    moodConfig: { type: MoodSchema, required: true },
    bannedUsers: { type: [BanSchema], default: [] },
    kickedUsers: { type: [KickSchema], default: [] },
    users: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
}, { timestamps: true });
ConfigSchema.post("save", function (doc) {
    if (doc && doc.serverID) {
        (0, configCache_1.invalidateGuildConfigCache)(doc.serverID);
    }
});
ConfigSchema.post(["findOneAndUpdate", "updateOne", "findOneAndDelete"], function (res) {
    const filter = this.getFilter ? this.getFilter() : {};
    const serverID = filter.serverID || (res && res.serverID);
    if (serverID) {
        (0, configCache_1.invalidateGuildConfigCache)(serverID);
    }
});
const Config = mongoose_1.default.model("Config", ConfigSchema);
exports.default = Config;
