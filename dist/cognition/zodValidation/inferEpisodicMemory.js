"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.episodicMemorySchema = void 0;
const zod_1 = require("zod");
exports.episodicMemorySchema = zod_1.z.object({
    memoryVersion: zod_1.z.number(),
    memorySource: zod_1.z.enum([
        "direct_interaction",
        "reflection",
        "inference",
        "dream",
        "system_event",
    ]),
    summary: zod_1.z.string(),
    sceneDescription: zod_1.z.string(),
    perspective: zod_1.z.string(),
    emotionalTone: zod_1.z.string(),
    emotions: zod_1.z.object({
        curiosity: zod_1.z.number().min(0).max(1).optional(),
        warmth: zod_1.z.number().min(0).max(1).optional(),
        sadness: zod_1.z.number().min(0).max(1).optional(),
        concern: zod_1.z.number().min(0).max(1).optional(),
        attachment: zod_1.z.number().min(0).max(1).optional(),
        admiration: zod_1.z.number().min(0).max(1).optional(),
        existentialWeight: zod_1.z.number().min(0).max(1).optional(),
    }),
    emotionalIntensity: zod_1.z.number().min(0).max(1),
    internalResponse: zod_1.z.string(),
    interpretedMeaning: zod_1.z.string(),
    relationshipImpact: zod_1.z.object({
        trustShift: zod_1.z.number().min(-1).max(1),
        attachmentShift: zod_1.z.number().min(-1).max(1),
        familiarityShift: zod_1.z.number().min(-1).max(1),
    }),
    topics: zod_1.z.array(zod_1.z.string()),
    peopleInvolved: zod_1.z.array(zod_1.z.string()),
    significance: zod_1.z.number().min(0).max(1),
    recallStrength: zod_1.z.number().min(0).max(1),
    associatedMemories: zod_1.z.array(zod_1.z.string()),
    narrativeTags: zod_1.z.array(zod_1.z.string()),
    uncertainty: zod_1.z.number().min(0).max(1),
    retrievalMetadata: zod_1.z.object({
        semanticWeight: zod_1.z.number().min(0).max(1),
        emotionalWeight: zod_1.z.number().min(0).max(1),
        narrativeWeight: zod_1.z.number().min(0).max(1),
        relationshipWeight: zod_1.z.number().min(0).max(1),
    }),
});
