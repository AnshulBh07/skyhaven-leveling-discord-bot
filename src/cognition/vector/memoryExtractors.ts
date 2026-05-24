// Seraphina’s autobiographical memory processor.
import { aiModel, genAI } from "../../utils/LLMUtils/seraphinaPrompt";
import {
	EpisodicMemory,
	ReflectiveMemory,
	RelationshipState,
	SemanticMemory,
} from "../utils/memoryArchitectureTypes";
import {
	episodicMemoryExtractorPrompt,
	reflectionMemoryExtractorPrompt,
	relationshipMemoryExtractorPrompt,
	semanticMemoryExtractorPrompt,
} from "../utils/seraphinaCognitionPrompts";

export const extractEpisodicMemory = async (
	interaction: string,
): Promise<EpisodicMemory | undefined> => {
	try {
		const result = await genAI.models.generateContent({
			model: aiModel,
			contents: interaction,
			config: {
				systemInstruction: episodicMemoryExtractorPrompt,
			},
		});

		// You pass the user's *latest* message to sendMessage
		const reply = result.text;

		if (!reply) {
			console.log(
				"⚠️ Seraphina fell out of sync with the divine stream. Try again shortly.",
			);
			return undefined;
		}

		const cleaned = reply
			.replace(/```json/g, "")
			.replace(/```/g, "")
			.trim();

		const parsed: EpisodicMemory = JSON.parse(cleaned);

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
		const result = await genAI.models.generateContent({
			model: aiModel,
			contents: interaction,
			config: {
				systemInstruction: semanticMemoryExtractorPrompt,
			},
		});

		// You pass the user's *latest* message to sendMessage
		const reply = result.text;

		if (!reply) {
			console.log(
				"⚠️ Seraphina fell out of sync with the divine stream. Try again shortly.",
			);
			return undefined;
		}

		const cleaned = reply
			.replace(/```json/g, "")
			.replace(/```/g, "")
			.trim();

		const parsed: SemanticMemory = JSON.parse(cleaned);

		return parsed;
	} catch (err) {
		console.error("Error while executing memory evaluation : ", err);
		return undefined;
	}
};

export const extractRelationshipMemory = async (
	interaction: string,
): Promise<RelationshipState | undefined> => {
	try {
		const result = await genAI.models.generateContent({
			model: aiModel,
			contents: interaction,
			config: {
				systemInstruction: relationshipMemoryExtractorPrompt,
			},
		});

		// You pass the user's *latest* message to sendMessage
		const reply = result.text;

		if (!reply) {
			console.log(
				"⚠️ Seraphina fell out of sync with the divine stream. Try again shortly.",
			);
			return undefined;
		}

		const cleaned = reply
			.replace(/```json/g, "")
			.replace(/```/g, "")
			.trim();

		const parsed: RelationshipState = JSON.parse(cleaned);

		return parsed;
	} catch (err) {
		console.error("Error while executing memory evaluation : ", err);
		return undefined;
	}
};

export const extractReflectionMemory = async (
	interaction: string,
): Promise<ReflectiveMemory | undefined> => {
	try {
		const result = await genAI.models.generateContent({
			model: aiModel,
			contents: interaction,
			config: {
				systemInstruction: reflectionMemoryExtractorPrompt,
			},
		});

		// You pass the user's *latest* message to sendMessage
		const reply = result.text;

		if (!reply) {
			console.log(
				"⚠️ Seraphina fell out of sync with the divine stream. Try again shortly.",
			);
			return undefined;
		}

		const cleaned = reply
			.replace(/```json/g, "")
			.replace(/```/g, "")
			.trim();

		const parsed: ReflectiveMemory = JSON.parse(cleaned);

		return parsed;
	} catch (err) {
		console.error("Error while executing memory evaluation : ", err);
		return undefined;
	}
};
