"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const GiveawaySchema = new Schema({
    serverID: { type: String, default: "", required: true },
    hostID: { type: String, default: "", required: true },
    messageID: { type: String, default: "", required: true },
    channelID: { type: String, default: "", required: true },
    endMessageID: { type: String, default: "", required: true },
    prize: { type: String, default: "", required: true },
    winnersCount: { type: Number, default: 0, required: true },
    participants: { type: [String], default: [], required: true },
    winners: { type: [String], default: [], required: true },
    imageUrl: { type: String, default: "" },
    role_req: { type: String, default: "" },
    role_color: { type: String, default: "" },
    starterMessage: { type: String, default: "" },
    // will use custom time stamps
    createdAt: { type: Number, required: true, default: Date.now },
    updatedAt: { type: Number, default: Date.now },
    endsAt: { type: Number, required: true, default: () => Date.now() + 1e9 },
    isEnded: { type: Boolean, required: true, default: false },
    isPaused: { type: Boolean, default: false },
}, { timestamps: false });
const Giveaway = mongoose_1.default.model("Giveaway", GiveawaySchema);
exports.default = Giveaway;
