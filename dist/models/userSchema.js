"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const Leveling = new mongoose_1.Schema({
    xp: { type: Number, default: 0 },
    textXp: { type: Number, default: 0 },
    voiceXp: { type: Number, default: 0 },
    totalXp: { type: Number, default: 0 },
    xpPerDay: { type: Map, of: Number, default: {}, required: true },
    level: { type: Number, default: 1 },
    lastMessageTimestamp: { type: Date, default: Date.now },
    lastPromotionTimestamp: { type: Date, default: Date.now },
    currentRole: { type: String, default: "" },
}, { timestamps: false, _id: false });
const Giveaways = new mongoose_1.Schema({
    isBanned: { type: Boolean, required: true, default: false },
    giveawaysWon: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Giveaway" }],
    giveawaysEntries: [
        { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Giveaway" },
    ],
}, { _id: false, timestamps: false, _v: false });
const GQuests = new mongoose_1.Schema({
    dmNotif: { type: Boolean, required: true, default: true },
    pending: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "GQuest" }],
    rewarded: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "GQuest" }],
    rejected: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "GQuest" }],
    lastSubmissionDate: { type: Date, default: Date.now },
    lastRewardDate: { type: Date, default: Date.now },
    lastRejectionDate: { type: Date, default: Date.now },
    totalRewarded: { type: Number, default: 0 },
}, { _id: false, timestamps: false, _v: false });
const Mazes = new mongoose_1.Schema({
    dmNotif: { type: Boolean, required: true, default: true },
    pending: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Maze" }],
    rewarded: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Maze" }],
    rejected: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Maze" }],
    lastSubmissionDate: { type: Date, default: Date.now },
    lastRewardDate: { type: Date, default: Date.now },
    lastRejectionDate: { type: Date, default: Date.now },
    totalRewarded: { type: Number, default: 0 },
}, { _id: false, timestamps: false, _v: false });
const Raids = new mongoose_1.Schema({
    dmNotif: { type: Boolean, default: true },
    completed: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Raid" }],
    noShows: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Raid" }],
    reliability: { type: Number, default: 0 },
}, { _id: false, timestamps: false, _v: false });
const UserSchema = new mongoose_1.Schema({
    userID: { type: String, required: true },
    username: { type: String, required: true },
    nickname: { type: String, default: "" },
    serverID: { type: String, required: true },
    leveling: { type: Leveling, required: true },
    giveaways: { type: Giveaways, required: true },
    gquests: { type: GQuests, required: true },
    mazes: { type: Mazes, required: true },
    raids: { type: Raids, required: true },
}, { timestamps: true });
UserSchema.index({ userID: 1, serverID: 1 }, { unique: true });
UserSchema.index({ serverID: 1, "leveling.totalXp": -1 });
const User = (0, mongoose_1.model)("User", UserSchema);
exports.default = User;
