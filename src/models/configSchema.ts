import mongoose from "mongoose";

const Schema = mongoose.Schema;

const levelRolesSchema = new Schema(
  {
    minLevel: { type: Number, requird: true },
    maxLevel: { type: Number, requird: true },
    roleID: { type: String, required: true },
  },
  { timestamps: false, _id: false }
);

const ConfigSchema = new Schema(
  {
    serverID: { type: String, required: true, unique: true, default: "" },
    botID: { type: String, required: true, default: "" },
    devsIDs: { type: [String], required: true, default: [] },
    levelRoles: { type: [levelRolesSchema], default: [] },
    notificationChannelID: { type: String, default: null },
    blacklistedChannels: { type: [String], default: [] }, //bot cannot be operated in these channels
    ignoredChannels: { type: [String], default: [] }, //bot ignores xp gain from these channels
    xpCooldown: { type: Number, default: 20000 },
  },
  { timestamps: true }
);

const Config = mongoose.model("Config", ConfigSchema);

export default Config;
