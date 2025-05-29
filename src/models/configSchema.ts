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
  { timestamps: false, _id: false }
);

const LevelingConfig = new Schema(
  {
    levelRoles: { type: [LevelRolesSchema], default: [] },
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
  },
  { timestamps: false, _id: false }
);

const ConfigSchema = new Schema(
  {
    serverID: { type: String, required: true, unique: true, default: "" },
    botID: { type: String, required: true, default: "" },
    devsIDs: { type: [String], required: true, default: [] },
    levelConfig: { type: LevelingConfig, required: true },
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
