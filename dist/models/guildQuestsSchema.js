"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
var StatusType;
(function (StatusType) {
    StatusType["PENDING"] = "pending";
    StatusType["REWARDED"] = "rewarded";
    StatusType["REJECTED"] = "rejected";
})(StatusType || (StatusType = {}));
const GQuestSchema = new Schema({
    serverID: { type: String, required: true, default: "" },
    userID: { type: String, required: true, default: "" },
    messageID: { type: String, required: true, default: "" }, //serves as gquest id
    channelID: { type: String, required: true, default: "" },
    gquestCount: { type: Number, required: true, default: 0 },
    imageUrl: { type: String, required: true, default: "" },
    imageHash: { type: String, required: true, default: "" },
    status: { type: String, enum: Object.values(StatusType), required: true },
    submittedAt: { type: Number, required: true, default: 0 },
    rewardedAt: { type: Number },
    rejectedAt: { type: Number },
    reviewedBy: { type: String, required: true, default: "" }, //admin disocrd id
    rejectionReason: { type: String }, //if rejected
    rewardMessageID: { type: String },
    proofImageUrl: { type: String },
    lastRewardBtnClickAt: { type: Number },
}, { timestamps: true });
const GQuest = mongoose_1.default.model("GQuest", GQuestSchema);
exports.default = GQuest;
