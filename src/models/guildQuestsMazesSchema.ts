import mongoose from "mongoose";
const Schema = mongoose.Schema;

enum StatusType {
  PENDING = "pending",
  REWARDED = "rewarded",
  REJECTED = "rejected",
}

enum taskType {
  MAZE = "maze",
  GQUEST = "gquest",
}

const GQuestMazeSchema = new Schema(
  {
    type: { type: String, enum: Object.values(taskType), required: true },
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
    rewardMessageID: { type: String },
    proofImageUrl: { type: String },
    lastRewardBtnClickAt: { type: Number },
  },
  { timestamps: true }
);

const GQuestMaze = mongoose.model("GQuestMaze", GQuestMazeSchema);

export default GQuestMaze;
