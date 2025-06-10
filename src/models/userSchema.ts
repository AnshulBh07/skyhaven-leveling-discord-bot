import mongoose, { Schema, model } from "mongoose";

const Leveling = new Schema(
  {
    xp: { type: Number, default: 0 },
    textXp: { type: Number, default: 0 },
    voiceXp: { type: Number, default: 0 },
    totalXp: { type: Number, default: 0 },
    xpPerDay: { type: Map, of: Number, defaultL: {}, required: true },
    level: { type: Number, default: 1 },
    lastMessageTimestamp: { type: Date, default: null },
    lastPromotionTimestamp: { type: Date, default: null },
    currentRole: { type: String, default: null },
  },
  { timestamps: false, _id: false }
);

const Giveaways = new Schema(
  {
    isBanned: { type: Boolean, required: true, default: false },
    giveawaysWon: [{ type: mongoose.Schema.Types.ObjectId, ref: "Giveaway" }],
    giveawaysEntries: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Giveaway" },
    ],
  },
  { _id: false, timestamps: false, _v: false }
);

const GQuests = new Schema(
  {
    dmNotif: { type: Boolean, required: true, default: true },
    pending: [{ type: mongoose.Schema.Types.ObjectId, ref: "GQuestMaze" }],
    rewarded: [{ type: mongoose.Schema.Types.ObjectId, ref: "GQuestMaze" }],
    rejected: [{ type: mongoose.Schema.Types.ObjectId, ref: "GQuestMaze" }],
    lastSubmissionDate: { type: Date, default: null },
    lastRewardDate: { type: Date, default: null },
    lastRejectionDate: { type: Date, default: null },
    totalRewarded: { type: Number, default: 0 },
  },
  { _id: false, timestamps: false, _v: false }
);

const Mazes = new Schema(
  {
    dmNotif: { type: Boolean, required: true, default: true },
    pending: [{ type: mongoose.Schema.Types.ObjectId, ref: "GQuestMaze" }],
    rewarded: [{ type: mongoose.Schema.Types.ObjectId, ref: "GQuestMaze" }],
    rejected: [{ type: mongoose.Schema.Types.ObjectId, ref: "GQuestMaze" }],
    lastSubmissionDate: { type: Date, default: null },
    lastRewardDate: { type: Date, default: null },
    lastRejectionDate: { type: Date, default: null },
    totalRewarded: { type: Number, default: 0 },
  },
  { _id: false, timestamps: false, _v: false }
);

const UserSchema = new Schema(
  {
    userID: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    nickname: { type: String, default: "" },
    serverID: { type: String, required: true },
    leveling: { type: Leveling, required: true },
    giveaways: { type: Giveaways, required: true },
    gquests: { type: GQuests, required: true },
    mazes: { type: Mazes, required: true },
  },
  { timestamps: true }
);

const User = model("User", UserSchema);

export default User;
