"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retriveRelatedMemories = void 0;
const episodicMemorySchema_1 = __importDefault(require("../../models/cognition/episodicMemorySchema"));
const reflectiveMemorySchema_1 = __importDefault(require("../../models/cognition/reflectiveMemorySchema"));
const relationshipStateSchema_1 = __importDefault(require("../../models/cognition/relationshipStateSchema"));
const semanticMemorySchema_1 = __importDefault(require("../../models/cognition/semanticMemorySchema"));
const generateEmbedding_1 = require("./generateEmbedding");
const qdrant_1 = require("./qdrant");
// we need to sort memories again taking score into consideration
// just like humans seraphina's memories should be psychologically weighted
// there are many factors that will influence her thinking which we have saved in mongo
const getFinalScore = (memory, vectorScore) => {
    let finalScore = vectorScore * 0.5;
    finalScore += memory.significance * 0.2;
    finalScore += memory.emotionalIntensity * 0.2;
    finalScore += memory.recallStrength * 0.1;
    return finalScore;
};
const getRelevantMemories = (memoryArr, scoreMap) => {
    // form a new array
    const ranked = memoryArr.map((memory) => {
        const vectorScore = scoreMap.get(memory.vector_embed_id) || 0;
        return Object.assign(Object.assign({}, memory), { finalScore: getFinalScore(memory, vectorScore) });
    });
    ranked.sort((a, b) => b.finalScore - a.finalScore);
    return ranked.slice(0, 5);
};
const getRelatedQdrantMemories = (vectorEmbed, user_id, collectionName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // we should have a maximum of 15 results from qdrant query
        const qdrantResults = (yield (0, qdrant_1.searchVector)(vectorEmbed, user_id, collectionName));
        const vectorIDs = qdrantResults.map((r) => r.id);
        const scoreMap = new Map(qdrantResults.map((r) => [r.id, r.score]));
        let memoryContext = "";
        // now hit mongodb based on collection name
        if (collectionName === "episodic_memories") {
            const episodicMemories = (yield episodicMemorySchema_1.default.find({
                vector_embed_id: { $in: vectorIDs },
            }).lean());
            const topMemories = getRelevantMemories(episodicMemories, scoreMap);
            memoryContext = `
				## Relevant Experiences

				${topMemories
                .map((memory) => `- ${memory.summary} (${memory.emotionalTone})`)
                .join("\n")}
				`;
        }
        if (collectionName === "semantic_memories") {
            const semanticMemories = (yield semanticMemorySchema_1.default.find({
                vector_embed_id: { $in: vectorIDs },
            }).lean());
            const topMemories = getRelevantMemories(semanticMemories, scoreMap);
            memoryContext = `## Known Truths
            
            ${topMemories.map((memory) => `${memory.statement}`).join("\n---\n")}`;
        }
        return memoryContext;
    }
    catch (err) {
        console.error("Error while fetching related episodic memories : ", err);
        return "";
    }
});
const getRelationshipContext = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const relationshipState = (yield relationshipStateSchema_1.default.findOne({
            user_id: user_id,
        }).lean());
        if (!relationshipState)
            return "";
        return `
		## Relationship Context

		- Overall impression: ${relationshipState.overallImpression}

		- User traits:
		${relationshipState.perceivedTraits
            .slice(0, 5)
            .map((t) => `  • ${t}`)
            .join("\n")}

		- Communication style:
		${relationshipState.communicationPatterns
            .slice(0, 3)
            .map((t) => `  • ${t}`)
            .join("\n")}

		- Shared dynamics:
		${relationshipState.recurringDynamics
            .slice(0, 3)
            .map((t) => `  • ${t}`)
            .join("\n")}

		${relationshipState.insideJokes.length
            ? `
		- Inside jokes:
		${relationshipState.insideJokes
                .slice(0, 3)
                .map((j) => `  • ${j}`)
                .join("\n")}
		`
            : ""}
		`;
    }
    catch (err) {
        console.error("Error while making relationship context : ", err);
        return "";
    }
});
const getReflectionContext = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reflectionMemories = (yield reflectiveMemorySchema_1.default.find({
            user_id: user_id,
        })
            .sort({ updatedAt: -1 })
            .limit(3)
            .lean());
        if (!reflectionMemories.length)
            return "";
        return `
		## Personal Reflections

		${reflectionMemories
            .map((reflection) => `- ${reflection.selfObservation}`)
            .join("\n")}
		`;
    }
    catch (err) {
        console.error("Error while forming reflection context : ", err);
        return "";
    }
});
// here we will retrieve all related memory layers and form context for each
const retriveRelatedMemories = (interaction, user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // genereate vector embedding first we need a point that can be placed on scatter plot to find all the nearby plots
        const vectorEmbed = yield (0, generateEmbedding_1.generateEmbedding)(interaction);
        if (!vectorEmbed.length)
            return "";
        // use promise.all() for parallel execution and add await so only proceeds after all resolved in porallel
        const [episodicContext, semanticContext, relationshipContext, reflectionContext,] = yield Promise.all([
            getRelatedQdrantMemories(vectorEmbed, user_id, "episodic_memories"),
            getRelatedQdrantMemories(vectorEmbed, user_id, "semantic_memories"),
            getRelationshipContext(user_id),
            getReflectionContext(user_id),
        ]);
        const retrievedMemories = [
            episodicContext,
            semanticContext,
            relationshipContext,
            reflectionContext,
        ].join("\n");
        return retrievedMemories;
    }
    catch (err) {
        console.error("Error while retrieving related memories : ", err);
        return "";
    }
});
exports.retriveRelatedMemories = retriveRelatedMemories;
