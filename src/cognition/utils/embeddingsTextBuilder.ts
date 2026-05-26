import { EpisodicMemory, SemanticMemory } from "./memoryArchitectureTypes";

export const buildEmbeddingText = (
	memory: EpisodicMemory | SemanticMemory,
	type: string,
): string => {
	switch (type) {
		case "episodic":
			return buildEpisodicEmbeddingText(memory as EpisodicMemory);

		case "semantic":
			return buildSemanticEmbeddingText(memory as SemanticMemory);

		default:
			return "";
	}
};

const buildEpisodicEmbeddingText = (memory: EpisodicMemory): string => {
	return `
Summary:
${memory.summary}

Scene Description:
${memory.sceneDescription}

Perspective:
${memory.perspective}

Emotional Tone:
${memory.emotionalTone}

Internal Response:
${memory.internalResponse}

Interpreted Meaning:
${memory.interpretedMeaning}

Topics:
${memory.topics.join(", ")}

Narrative Tags:
${memory.narrativeTags.join(", ")}

People Involved:
${memory.peopleInvolved.join(", ")}
`;
};

const buildSemanticEmbeddingText = (memory: SemanticMemory): string => {
	return `
Statement:
${memory.statement}

Category:
${memory.category}

Source:
${memory.source}

Topics:
${memory.topics.join(", ")}

Related Entities:
${memory.relatedEntities.join(", ")}
`;
};
