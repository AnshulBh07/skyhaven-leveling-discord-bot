import { z } from "zod";

export const episodicMemorySchema = z.object({
	memoryVersion: z.number(),

	memorySource: z.enum([
		"direct_interaction",
		"reflection",
		"inference",
		"dream",
		"system_event",
	]),

	summary: z.string(),

	sceneDescription: z.string(),

	perspective: z.string(),

	emotionalTone: z.string(),

	emotions: z.object({
		curiosity: z.number().min(0).max(1),

		warmth: z.number().min(0).max(1),

		sadness: z.number().min(0).max(1),

		concern: z.number().min(0).max(1),

		attachment: z.number().min(0).max(1),

		admiration: z.number().min(0).max(1),

		existentialWeight: z.number().min(0).max(1),
	}),

	emotionalIntensity: z.number().min(0).max(1),

	internalResponse: z.string(),

	interpretedMeaning: z.string(),

	relationshipImpact: z.object({
		trustShift: z.number().min(-1).max(1),

		attachmentShift: z.number().min(-1).max(1),

		familiarityShift: z.number().min(-1).max(1),
	}),

	topics: z.array(z.string()),

	peopleInvolved: z.array(z.string()),

	significance: z.number().min(0).max(1),

	recallStrength: z.number().min(0).max(1),

	associatedMemories: z.array(z.string()),

	narrativeTags: z.array(z.string()),

	uncertainty: z.number().min(0).max(1),

	retrievalMetadata: z.object({
		semanticWeight: z.number().min(0).max(1),

		emotionalWeight: z.number().min(0).max(1),

		narrativeWeight: z.number().min(0).max(1),

		relationshipWeight: z.number().min(0).max(1),
	}),
});

export type EpisodicMemorySchema = z.infer<typeof episodicMemorySchema>;
