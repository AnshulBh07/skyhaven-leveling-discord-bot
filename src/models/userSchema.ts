import mongoose, { Schema, model } from "mongoose";

const Leveling = new Schema(
  {
    xp: { type: Number, default: 0 },
    textXp: { type: Number, default: 0 },
    voiceXp: { type: Number, default: 0 },
    totalXp: { type: Number, default: 0 },
    xpPerDay: { type: Map, of: Number, default: {}, required: true },
    level: { type: Number, default: 1 },
    lastMessageTimestamp: { type: Date, default: Date.now },
    lastPromotionTimestamp: { type: Date, default: Date.now },
    currentRole: { type: String, default: "" },
  },
  { timestamps: false, _id: false },
);

const Giveaways = new Schema(
  {
    isBanned: { type: Boolean, required: true, default: false },
    giveawaysWon: [{ type: mongoose.Schema.Types.ObjectId, ref: "Giveaway" }],
    giveawaysEntries: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Giveaway" },
    ],
  },
  { _id: false, timestamps: false, _v: false },
);

const GQuests = new Schema(
  {
    dmNotif: { type: Boolean, required: true, default: true },
    pending: [{ type: mongoose.Schema.Types.ObjectId, ref: "GQuest" }],
    rewarded: [{ type: mongoose.Schema.Types.ObjectId, ref: "GQuest" }],
    rejected: [{ type: mongoose.Schema.Types.ObjectId, ref: "GQuest" }],
    lastSubmissionDate: { type: Date, default: Date.now },
    lastRewardDate: { type: Date, default: Date.now },
    lastRejectionDate: { type: Date, default: Date.now },
    totalRewarded: { type: Number, default: 0 },
  },
  { _id: false, timestamps: false, _v: false },
);

const Mazes = new Schema(
  {
    dmNotif: { type: Boolean, required: true, default: true },
    pending: [{ type: mongoose.Schema.Types.ObjectId, ref: "Maze" }],
    rewarded: [{ type: mongoose.Schema.Types.ObjectId, ref: "Maze" }],
    rejected: [{ type: mongoose.Schema.Types.ObjectId, ref: "Maze" }],
    lastSubmissionDate: { type: Date, default: Date.now },
    lastRewardDate: { type: Date, default: Date.now },
    lastRejectionDate: { type: Date, default: Date.now },
    totalRewarded: { type: Number, default: 0 },
  },
  { _id: false, timestamps: false, _v: false },
);

const Raids = new Schema(
  {
    dmNotif: { type: Boolean, default: true },
    completed: [{ type: mongoose.Schema.Types.ObjectId, ref: "Raid" }],
    noShows: [{ type: mongoose.Schema.Types.ObjectId, ref: "Raid" }],
    reliability: { type: Number, default: 0 },
  },
  { _id: false, timestamps: false, _v: false },
);

const UserSchema = new Schema(
  {
    userID: { type: String, required: true },
    username: { type: String, required: true },
    nickname: { type: String, default: "" },
    serverID: { type: String, required: true },
    leveling: { type: Leveling, required: true },
    giveaways: { type: Giveaways, required: true },
    gquests: { type: GQuests, required: true },
    mazes: { type: Mazes, required: true },
    raids: { type: Raids, required: true },
  },
  { timestamps: true },
);

UserSchema.index({ userID: 1, serverID: 1 }, { unique: true });
UserSchema.index({ serverID: 1, "leveling.totalXp": -1 });

const User = model("User", UserSchema);

export default User;
