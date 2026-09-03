import EpisodicMemoryModel from "../../models/cognition/episodicMemorySchema";
import ReflectiveMemoryModel from "../../models/cognition/reflectiveMemorySchema";
import RelationshipStateModel from "../../models/cognition/relationshipStateSchema";
import SemanticMemoryModel from "../../models/cognition/semanticMemorySchema";
import {
	IQdrantRetrieved,
	MappedEpisodicMemory,
	MappedSemanticMemory,
	StoredEpisodicMemory,
	StoredReflectionMemory,
	StoredRelationshipMemory,
	StoredSemanticMemory,
} from "../utils/memoryArchitectureTypes";
import { generateEmbedding } from "./generateEmbedding";
import { searchVector } from "./qdrant";

// we need to sort memories again taking score into consideration
// just like humans seraphina's memories should be psychologically weighted
// there are many factors that will influence her thinking which we have saved in mongo
const getFinalScore = (
	memory: StoredSemanticMemory | StoredEpisodicMemory,
	vectorScore: number,
) => {
	let finalScore = vectorScore * 0.5;

	finalScore += memory.significance * 0.2;
	finalScore += memory.emotionalIntensity * 0.2;
	finalScore += memory.recallStrength * 0.1;

	return finalScore;
};

const getRelevantMemories = (
	memoryArr: StoredSemanticMemory[] | StoredEpisodicMemory[],
	scoreMap: Map<string, number>,
) => {
	// form a new array
	const ranked = memoryArr.map((memory) => {
		const vectorScore = scoreMap.get(memory.vector_embed_id!) || 0;

		return {
			...memory,
			finalScore: getFinalScore(memory, vectorScore),
		};
	});

	ranked.sort((a, b) => b.finalScore - a.finalScore);

	return ranked.slice(0, 5);
};

const getRelatedQdrantMemories = async (
	vectorEmbed: number[],
	user_id: string,
	collectionName: string,
) => {
	try {
		// we should have a maximum of 15 results from qdrant query
		const qdrantResults = (await searchVector(
			vectorEmbed,
			user_id,
			collectionName,
		)) as IQdrantRetrieved[];

		const vectorIDs = qdrantResults.map((r) => r.id);

		const scoreMap = new Map(qdrantResults.map((r) => [r.id, r.score]));

		let memoryContext = "";

		// now hit mongodb based on collection name
		if (collectionName === "episodic_memories") {
			const episodicMemories = (await EpisodicMemoryModel.find({
				vector_embed_id: { $in: vectorIDs },
			}).lean()) as StoredEpisodicMemory[];

			const topMemories = getRelevantMemories(
				episodicMemories,
				scoreMap,
			) as MappedEpisodicMemory[];

			memoryContext = `
				## Relevant Experiences

				${topMemories
					.map((memory) => `- ${memory.summary} (${memory.emotionalTone})`)
					.join("\n")}
				`;
		}

		if (collectionName === "semantic_memories") {
			const semanticMemories = (await SemanticMemoryModel.find({
				vector_embed_id: { $in: vectorIDs },
			}).lean()) as StoredSemanticMemory[];

			const topMemories = getRelevantMemories(
				semanticMemories,
				scoreMap,
			) as MappedSemanticMemory[];

			memoryContext = `## Known Truths
            
            ${topMemories.map((memory) => `${memory.statement}`).join("\n---\n")}`;
		}

		return memoryContext;
	} catch (err) {
		console.error("Error while fetching related episodic memories : ", err);
		return "";
	}
};

const getRelationshipContext = async (user_id: string) => {
	try {
		const relationshipState = (await RelationshipStateModel.findOne({
			user_id: user_id,
		}).lean()) as StoredRelationshipMemory;

		if (!relationshipState) return "";

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

		${
			relationshipState.insideJokes.length
				? `
		- Inside jokes:
		${relationshipState.insideJokes
			.slice(0, 3)
			.map((j) => `  • ${j}`)
			.join("\n")}
		`
				: ""
		}
		`;
	} catch (err) {
		console.error("Error while making relationship context : ", err);
		return "";
	}
};

const getReflectionContext = async (user_id: string) => {
	try {
		const reflectionMemories = (await ReflectiveMemoryModel.find({
			user_id: user_id,
		})
			.sort({ updatedAt: -1 })
			.limit(3)
			.lean()) as StoredReflectionMemory[];

		if (!reflectionMemories.length) return "";

		return `
		## Personal Reflections

		${reflectionMemories
			.map((reflection) => `- ${reflection.selfObservation}`)
			.join("\n")}
		`;
	} catch (err) {
		console.error("Error while forming reflection context : ", err);
		return "";
	}
};

// here we will retrieve all related memory layers and form context for each
export const retriveRelatedMemories = async (
	interaction: string,
	user_id: string,
): Promise<string> => {
	try {
		// genereate vector embedding first we need a point that can be placed on scatter plot to find all the nearby plots
		const vectorEmbed = await generateEmbedding(interaction);

		if (!vectorEmbed.length) return "";

		// use promise.all() for parallel execution and add await so only proceeds after all resolved in porallel
		const [
			episodicContext,
			semanticContext,
			relationshipContext,
			reflectionContext,
		] = await Promise.all([
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
	} catch (err) {
		console.error("Error while retrieving related memories : ", err);
		return "";
	}
};
