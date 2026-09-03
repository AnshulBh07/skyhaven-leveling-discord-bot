"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const RelationshipStateSchema = new Schema({
    overallImpression: { type: String, required: true },
    emotionalAssociations: { type: [String], default: [] },
    perceivedTraits: { type: [String], default: [] },
    communicationPatterns: { type: [String], default: [] },
    attachmentLevel: { type: Number, required: true },
    trustLevel: { type: Number, required: true },
    familiarityLevel: { type: Number, required: true },
    emotionalSafety: { type: Number, required: true },
    recurringDynamics: { type: [String], default: [] },
    insideJokes: { type: [String], default: [] },
    unresolvedTensions: { type: [String], default: [] },
    behavioralExpectations: { type: [String], default: [] },
    lastInteractionSummary: { type: String, required: true },
    relationshipNarrative: { type: String, required: true },
    // required fields
    user_id: { type: String, required: true, unique: true, index: true },
    createdAt: { type: Number, required: true, default: Date.now },
    updatedAt: { type: Number, required: true, default: Date.now },
}, { timestamps: false, _v: false });
const RelationshipStateModel = mongoose_1.default.model("RelationshipStateModel", RelationshipStateSchema);
exports.default = RelationshipStateModel;
