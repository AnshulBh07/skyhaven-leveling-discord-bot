import { z } from "zod";

export const memoryEvaluationSchema = z.object({
	shouldCreateMemory: z.boolean(),

	reason: z.string(),

	memoryTypes: z.object({
		episodic: z.boolean(),

		semantic: z.boolean(),

		relationship: z.boolean(),

		reflectionCandidate: z.boolean(),
	}),

	emotionalSignificance: z.number().min(0).max(1),

	narrativeSignificance: z.number().min(0).max(1),

	relationshipSignificance: z.number().min(0).max(1),
});

export type MemoryEvaluation = z.infer<typeof memoryEvaluationSchema>;
