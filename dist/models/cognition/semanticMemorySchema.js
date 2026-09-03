"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const SemanticMemorySchema = new Schema({
    memoryVersion: { type: Number, required: true, default: 1 },
    source: {
        type: String,
        required: true,
        enum: ["direct_statement", "repeated_pattern", "inference"],
    },
    category: {
        type: String,
        required: true,
        enum: [
            "identity",
            "preference",
            "project",
            "relationship",
            "belief",
            "interest",
            "routine",
            "life_event",
        ],
    },
    statement: { type: String, required: true },
    confidence: { type: Number, required: true },
    stability: { type: Number, required: true },
    significance: { type: Number, required: true },
    topics: { type: [String], default: [] },
    relatedEntities: { type: [String], default: [] },
    emotionalIntensity: { type: Number, required: true },
    recallStrength: { type: Number, required: true },
    user_id: { type: String, required: true },
    createdAt: { type: Number, required: true, default: Date.now },
    updatedAt: { type: Number, required: true, default: Date.now },
    times_recalled: { type: Number, required: true },
    last_recalled: { type: Number },
    vector_embed_id: { type: String },
}, { timestamps: false, _v: false });
SemanticMemorySchema.index({ vector_embed_id: 1 });
const SemanticMemoryModel = mongoose_1.default.model("SemanticMemoryModel", SemanticMemorySchema);
exports.default = SemanticMemoryModel;
