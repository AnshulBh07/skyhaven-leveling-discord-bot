"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildEmbeddingText = void 0;
const buildEmbeddingText = (memory, type) => {
    switch (type) {
        case "episodic":
            return buildEpisodicEmbeddingText(memory);
        case "semantic":
            return buildSemanticEmbeddingText(memory);
        default:
            return "";
    }
};
exports.buildEmbeddingText = buildEmbeddingText;
const buildEpisodicEmbeddingText = (memory) => {
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
const buildSemanticEmbeddingText = (memory) => {
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
