"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const MessageSchema = new Schema({
    role: {
        type: String,
        enum: ["user", "model", "system"],
        required: true,
    },
    content: { type: String },
    timeStamp: { type: Number, default: Date.now },
}, { timestamps: false });
const ChatMemorySchema = new Schema({
    userID: { type: String, required: true },
    messages: { type: [MessageSchema], default: [] },
}, { timestamps: true });
const ChatMemory = mongoose_1.default.model("ChatMemory", ChatMemorySchema);
exports.default = ChatMemory;
