"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.semanticMemorySchema = void 0;
const zod_1 = require("zod");
exports.semanticMemorySchema = zod_1.z.object({
    category: zod_1.z.enum([
        "identity",
        "preference",
        "project",
        "relationship",
        "belief",
        "interest",
        "routine",
        "life_event",
    ]),
    source: zod_1.z.enum(["direct_statement", "repeated_pattern", "inference"]),
    statement: zod_1.z.string(),
    confidence: zod_1.z.number().min(0).max(1),
    stability: zod_1.z.number().min(0).max(1),
    significance: zod_1.z.number().min(0).max(1),
    topics: zod_1.z.array(zod_1.z.string()),
    relatedEntities: zod_1.z.array(zod_1.z.string()),
    emotionalIntensity: zod_1.z.number().min(0).max(1),
    recallStrength: zod_1.z.number().min(0).max(1),
});
