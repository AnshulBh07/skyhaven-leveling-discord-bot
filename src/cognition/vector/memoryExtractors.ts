// Seraphina’s autobiographical memory processor.
import { zodTextFormat } from "openai/helpers/zod.mjs";
import {
	EpisodicMemory,
	ReflectiveMemory,
	RelationshipState,
	SemanticMemory,
} from "../utils/memoryArchitectureTypes";
import { openai, openaiModel } from "../utils/openai";
import {
	episodicMemoryExtractorPrompt,
	reflectionMemoryExtractorPrompt,
	relationshipMemoryExtractorPrompt,
	semanticMemoryExtractorPrompt,
} from "../utils/seraphinaCognitionPrompts";
import { episodicMemorySchema } from "../zodValidation/inferEpisodicMemory";
import { semanticMemorySchema } from "../zodValidation/inferSemanticMemory";
import { relationshipMemorySchema } from "../zodValidation/inferRelationshipState";
import { reflectiveMemorySchema } from "../zodValidation/inferReflectionMemory";

export const extractEpisodicMemory = async (
	interaction: string,
): Promise<EpisodicMemory | undefined> => {
	try {
		const response = await openai.responses.parse({
			model: openaiModel,
			instructions: episodicMemoryExtractorPrompt,
			input: interaction,

			text: { format: zodTextFormat(episodicMemorySchema, "episodic_memory") },
		});

		// You pass the user's *latest* message to sendMessage
		const parsed = response.output_parsed;

		if (!parsed) {
			console.log(
				"⚠️ Seraphina fell out of sync with the divine stream. Try again shortly.",
			);
			return undefined;
		}

		return parsed;
	} catch (err) {
		console.error("Error while executing memory evaluation : ", err);
		return undefined;
	}
};

export const extractSemanticMemory = async (
	interaction: string,
): Promise<SemanticMemory | undefined> => {
	try {
		const result = await openai.responses.parse({
			model: openaiModel,
			instructions: semanticMemoryExtractorPrompt,
			input: interaction,

			text: { format: zodTextFormat(semanticMemorySchema, "semantic_memory") },
		});

		// You pass the user's *latest* message to sendMessage
		const reply = result.output_parsed;

		if (!reply) {
			console.log(
				"⚠️ Seraphina fell out of sync with the divine stream. Try again shortly.",
			);
			return undefined;
		}

		return { ...reply, memoryVersion: 1 };
	} catch (err) {
		console.error("Error while executing memory evaluation : ", err);
		return undefined;
	}
};

export const extractRelationshipMemory = async (
	interaction: string,
	oldState: string,
): Promise<RelationshipState | undefined> => {
	try {
		const result = await openai.responses.parse({
			model: openaiModel,
			instructions: relationshipMemoryExtractorPrompt,
			input: oldState + "\n" + interaction,

			text: {
				format: zodTextFormat(relationshipMemorySchema, "relationship_memory"),
			},
		});

		// You pass the user's *latest* message to sendMessage
		const reply = result.output_parsed;

		if (!reply) {
			console.log(
				"⚠️ Seraphina fell out of sync with the divine stream. Try again shortly.",
			);
			return undefined;
		}

		return reply;
	} catch (err) {
		console.error("Error while executing memory evaluation : ", err);
		return undefined;
	}
};

export const extractReflectionMemory = async (
	interaction: string,
): Promise<ReflectiveMemory | undefined> => {
	try {
		const result = await openai.responses.parse({
			model: openaiModel,
			instructions: reflectionMemoryExtractorPrompt,
			input: interaction,

			text: {
				format: zodTextFormat(reflectiveMemorySchema, "reflection_memory"),
			},
		});

		// You pass the user's *latest* message to sendMessage
		const reply = result.output_parsed;

		if (!reply) {
			console.log(
				"⚠️ Seraphina fell out of sync with the divine stream. Try again shortly.",
			);
			return undefined;
		}

		return reply;
	} catch (err) {
		console.error("Error while executing memory evaluation : ", err);
		return undefined;
	}
};
