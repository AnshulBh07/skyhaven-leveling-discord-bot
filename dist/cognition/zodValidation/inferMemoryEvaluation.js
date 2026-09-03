"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryEvaluationSchema = void 0;
const zod_1 = require("zod");
exports.memoryEvaluationSchema = zod_1.z.object({
    shouldCreateMemory: zod_1.z.boolean(),
    reason: zod_1.z.string(),
    memoryTypes: zod_1.z.object({
        episodic: zod_1.z.boolean(),
        semantic: zod_1.z.boolean(),
        relationship: zod_1.z.boolean(),
        reflectionCandidate: zod_1.z.boolean(),
    }),
    emotionalSignificance: zod_1.z.number().min(0).max(1),
    narrativeSignificance: zod_1.z.number().min(0).max(1),
    relationshipSignificance: zod_1.z.number().min(0).max(1),
});
