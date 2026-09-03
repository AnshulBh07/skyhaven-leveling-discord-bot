"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reflectiveMemorySchema = void 0;
const zod_1 = require("zod");
exports.reflectiveMemorySchema = zod_1.z.object({
    triggerEvent: zod_1.z.string(),
    reflection: zod_1.z.string(),
    selfObservation: zod_1.z.string(),
    behavioralAdjustment: zod_1.z.string(),
    emotionalEffect: zod_1.z.string(),
    confidence: zod_1.z.number().min(0).max(1),
    relatedMemories: zod_1.z.array(zod_1.z.string()),
    personalityImpact: zod_1.z.object({
        curiosity: zod_1.z.number().min(-1).max(1),
        warmth: zod_1.z.number().min(-1).max(1),
        protectiveness: zod_1.z.number().min(-1).max(1),
        philosophical: zod_1.z.number().min(-1).max(1),
    }),
});
