import { Schema, model } from "mongoose";

const Leveling = new Schema(
  {
    xp: { type: Number, default: 0 },
    totalXp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    lastMessageTimestamp: { type: Date, default: null },
    lastPromotionTimestamp: { type: Date, default: null },
    currentRole: { type: String, default: null },
  },
  { timestamps: true, _id: false }
);

const UserSchema = new Schema(
  {
    userID: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    serverID: { type: String, required: true },
    leveling: { type: Leveling, required: true },
  },
  { timestamps: true }
);

const UserStats = model("User", UserSchema);

export default UserStats;
