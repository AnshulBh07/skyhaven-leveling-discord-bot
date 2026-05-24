import { z } from "zod";

export const semanticMemorySchema = z.object({
	category: z.enum([
		"identity",
		"preference",
		"project",
		"relationship",
		"belief",
		"interest",
		"routine",
		"life_event",
	]),

	source: z.enum(["direct_statement", "repeated_pattern", "inference"]),

	statement: z.string(),

	confidence: z.number().min(0).max(1),

	stability: z.number().min(0).max(1),

	significance: z.number().min(0).max(1),

	topics: z.array(z.string()),

	relatedEntities: z.array(z.string()),

	emotionalIntensity: z.number().min(0).max(1),

	recallStrength: z.number().min(0).max(1),
});

export type SemanticMemorySchema = z.infer<typeof semanticMemorySchema>;
