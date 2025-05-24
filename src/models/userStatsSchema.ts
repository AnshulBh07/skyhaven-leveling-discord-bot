import { Schema, model } from "mongoose";

const userStatsSchema = new Schema(
  {
    userID: { type: String, required: true, unique: true },
    serverID: { type: String, required: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    lastMessageTimestamp: { type: Date, default: null },
    lastPromotionTimestamp: { type: Date, default: null },
    currentRole: { type: String, default: null },
  },
  { timestamps: true }
);

const UserStats = model("UserStats", userStatsSchema);

export default UserStats;
