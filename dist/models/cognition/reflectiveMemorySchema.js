"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const PersonalityImpactSchema = new Schema({
    curiosity: { type: Number },
    warmth: { type: Number },
    protectiveness: { type: Number },
    philosophical: { type: Number },
}, { timestamps: false, _v: false, _id: false });
const ReflectiveMemorySchema = new Schema({
    triggerEvent: { type: String, required: true },
    reflection: { type: String, required: true },
    selfObservation: { type: String, required: true },
    behavioralAdjustment: { type: String, required: true },
    emotionalEffect: { type: String, required: true },
    confidence: { type: Number, required: true },
    relatedMemories: { type: [String], required: true },
    personalityImpact: {
        type: PersonalityImpactSchema,
    },
    user_id: { type: String, required: true },
    createdAt: { type: Number, required: true, default: Date.now },
    updatedAt: { type: Number, required: true, default: Date.now },
}, { timestamps: false, _v: false });
ReflectiveMemorySchema.index({ user_id: 1, updatedAt: -1 });
const ReflectiveMemoryModel = mongoose_1.default.model("ReflectiveMemoryModel", ReflectiveMemorySchema);
exports.default = ReflectiveMemoryModel;
