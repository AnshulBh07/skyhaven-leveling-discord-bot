import { z } from "zod";

export const reflectiveMemorySchema = z.object({
	triggerEvent: z.string(),

	reflection: z.string(),

	selfObservation: z.string(),

	behavioralAdjustment: z.string(),

	emotionalEffect: z.string(),

	confidence: z.number().min(0).max(1),

	relatedMemories: z.array(z.string()),

	personalityImpact: z.object({
		curiosity: z.number().min(-1).max(1),

		warmth: z.number().min(-1).max(1),

		protectiveness: z.number().min(-1).max(1),

		philosophical: z.number().min(-1).max(1),
	}),
});

export type ReflectiveMemorySchema = z.infer<typeof reflectiveMemorySchema>;
