import mongoose from "mongoose";
const Schema = mongoose.Schema;

enum StatusType {
  PENDING = "pending",
  REWARDED = "rewarded",
  REJECTED = "rejected",
}

const GQuestSchema = new Schema(
  {
    serverID: { type: String, required: true, default: "" },
    userID: { type: String, required: true, default: "" },
    messageID: { type: String, required: true, default: "" }, //serves as gquest id
    channelID: { type: String, required: true, default: "" },
    imageUrl: { type: String, required: true, default: "" },
    imageHash: { type: String, required: true, default: "" },
    status: { type: String, enum: Object.values(StatusType), required: true },
    submittedAt: { type: Number, required: true, default: null },
    rewardedAt: { type: Number },
    rejectedAt: { type: Number },
    reviewedBy: { type: String, required: true, default: "" }, //admin disocrd id
    rejectionReason: { type: String }, //if rejected
  },
  { timestamps: true }
);

const GQuest = mongoose.model("GQuest", GQuestSchema);

export default GQuest;
