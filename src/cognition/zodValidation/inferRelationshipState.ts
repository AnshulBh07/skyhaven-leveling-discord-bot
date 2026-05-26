import { z } from "zod";

export const relationshipMemorySchema = z.object({
	overallImpression: z.string(),

	emotionalAssociations: z.array(z.string()),

	perceivedTraits: z.array(z.string()),

	communicationPatterns: z.array(z.string()),

	attachmentLevel: z.number().min(0).max(1),

	trustLevel: z.number().min(0).max(1),

	familiarityLevel: z.number().min(0).max(1),

	emotionalSafety: z.number().min(0).max(1),

	recurringDynamics: z.array(z.string()),

	insideJokes: z.array(z.string()),

	unresolvedTensions: z.array(z.string()),

	behavioralExpectations: z.array(z.string()),

	lastInteractionSummary: z.string(),

	relationshipNarrative: z.string(),
});

export type RelationshipMemorySchema = z.infer<typeof relationshipMemorySchema>;
