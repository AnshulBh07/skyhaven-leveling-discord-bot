// this is the config for a guild accessed by main bot
// each supposed minibot is represented as a new sub subsystem for core bot
// therefore contains config for each system
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const LevelRolesSchema = new Schema(
  {
    minLevel: { type: Number, requird: true },
    maxLevel: { type: Number, requird: true },
    roleID: { type: String, required: true },
  },
  { timestamps: false, _id: false, _v: false }
);

const GiveawayRolesSchema = new Schema(
  {
    roleID: { type: String, required: true, default: "" },
    name: { type: String, required: true, default: "" },
  },
  { timestamps: false, _id: false, _v: false }
);

const BanSchema = new Schema(
  {
    userID: { type: String, required: true, default: "" },
    reason: { type: String, default: "" },
    banDate: { type: Date, required: true, default: new Date() },
  },
  { timestamps: false, _id: false, _v: false }
);

const LevelingConfig = new Schema(
  {
    levelRoles: { type: [LevelRolesSchema], default: [] },
    managerRoles: { type: [String], required: true, default: [] },
    notificationChannelID: { type: String, default: null },
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
  },
  { timestamps: false, _id: false, _v: false }
);

const ModerationConfig = new Schema(
  {
    welcomeMessage: { type: String, default: "" },
    welcomeChannelID: { type: String, default: "" },
    farewellChannelID: { type: String, default: "" },
    farewellMessage: { type: String, default: "" },
    serverBoostChannelID: { type: String, default: "" },
    botAdminIDs: { type: [String], required: true, default: [] }, //can perform bot configuration
  },
  { timestamps: false, _id: false, _v: false }
);

const GiveawayConfig = new Schema(
  {
    roles: { type: [GiveawayRolesSchema], default: [] },
    giveawayRole: { type: String, default: "" },
    managerRoles: { type: [String], default: [] },
    giveawayChannelID: { type: String, default: "" },
    banList: { type: [BanSchema], default: [] },
  },
  { timestamps: false, _id: false, _v: false }
);

const GquestMazeConfig = new Schema(
  {
    mazeChannelID: { type: String, default: "" },
    gquestChannelID: { type: String, default: "" },
    gquestRole: { type: String, default: "" },
    mazeRole: { type: String, default: "" },
    managerRoles: { type: [String], default: [] },
    gquestRewardAmount: { type: Number, default: 0 },
    mazeRewardAmount: { type: Number, default: 0 },
  },
  { timestamps: false, _id: false, _v: false }
);

const RaidConfig = new Schema(
  {
    raidChannelID: { type: String, default: "" },
    raidRole: { type: String, default: "" },
    raidDay: { type: Number, default: 5 }, //defaults to saturday
    raidTime: { type: String, default: "22:30" }, //raid time in jst
    managerRoles: { type: [String], default: [] },
    banList: { type: [BanSchema], default: [] },
    tankEmojiID: { type: String, default: "" },
    dpsEmojiID: { type: String, default: "" },
    supportEmojiID: { type: String, default: "" },
  },
  { timestamps: false, _id: false, _v: false }
);

const MoodSchema = new Schema(
  {
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
  },
  { timestamps: true, _id: false, _v: false }
);

const ConfigSchema = new Schema(
  {
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
    moodConfig: { type: MoodSchema, required: true },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Config = mongoose.model("Config", ConfigSchema);

export default Config;
