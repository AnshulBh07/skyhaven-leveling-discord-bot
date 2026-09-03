"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.relationshipMemorySchema = void 0;
const zod_1 = require("zod");
exports.relationshipMemorySchema = zod_1.z.object({
    overallImpression: zod_1.z.string(),
    emotionalAssociations: zod_1.z.array(zod_1.z.string()),
    perceivedTraits: zod_1.z.array(zod_1.z.string()),
    communicationPatterns: zod_1.z.array(zod_1.z.string()),
    attachmentLevel: zod_1.z.number().min(0).max(1),
    trustLevel: zod_1.z.number().min(0).max(1),
    familiarityLevel: zod_1.z.number().min(0).max(1),
    emotionalSafety: zod_1.z.number().min(0).max(1),
    recurringDynamics: zod_1.z.array(zod_1.z.string()),
    insideJokes: zod_1.z.array(zod_1.z.string()),
    unresolvedTensions: zod_1.z.array(zod_1.z.string()),
    behavioralExpectations: zod_1.z.array(zod_1.z.string()),
    lastInteractionSummary: zod_1.z.string(),
    relationshipNarrative: zod_1.z.string(),
});
