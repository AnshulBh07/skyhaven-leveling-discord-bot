import { buildEmbeddingText } from "../utils/embeddingsTextBuilder";
import { evaluateMemory } from "../utils/memoryEvaluation";
import {
	extractEpisodicMemory,
	extractReflectionMemory,
	extractRelationshipMemory,
	extractSemanticMemory,
} from "./memoryExtractors";
import { evaluateBeliefTrust } from "../utils/semanticBeliefsFilter";
import { episodicMemorySchema } from "../zodValidation/inferEpisodicMemory";
import { reflectiveMemorySchema } from "../zodValidation/inferReflectionMemory";
import { relationshipMemorySchema } from "../zodValidation/inferRelationshipState";
import { semanticMemorySchema } from "../zodValidation/inferSemanticMemory";
import { generateEmbedding } from "./generateEmbedding";
import { insertVector, VECTOR_SIZE } from "./qdrant";
import {
	QdrantPayload,
	RelationshipState,
} from "../utils/memoryArchitectureTypes";
import EpisodicMemoryModel from "../../models/cognition/episodicMemorySchema";
import SemanticMemoryModel from "../../models/cognition/semanticMemorySchema";
import RelationshipStateModel from "../../models/cognition/relationshipStateSchema";
import ReflectiveMemoryModel from "../../models/cognition/reflectiveMemorySchema";

export const runCognition = async (interaction: string, user_id: string) => {
	try {
		// decide what type of memory it has to be
		const evaluated = await evaluateMemory(interaction);

		if (!evaluated) return;

		// work depending on type of memorry
		if (evaluated.memoryTypes.episodic) {
			const episodicResult = await extractEpisodicMemory(interaction);

			const parsed = episodicMemorySchema.safeParse(episodicResult);

			if (episodicResult && parsed.success) {
				// now that our LLM response is valid we will create embeddings for the result
				const text = buildEmbeddingText(episodicResult, "episodic");

				if (text.length) {
					const vectorEmbed = await generateEmbedding(text);

					if (vectorEmbed.length === VECTOR_SIZE) {
						// now save in vector db (qdrant)
						const vectorID = crypto.randomUUID();

						const qdrant_payload: QdrantPayload = {
							userID: user_id,
							type: "episodic",
						};

						await insertVector(
							vectorEmbed,
							"episodic_memories",
							vectorID,
							qdrant_payload,
						);

						// insert in mongodb
						await EpisodicMemoryModel.create({
							...episodicResult,
							times_recalled: 0,
							createdAt: Date.now(),
							updatedAt: Date.now(),
							user_id: user_id,
							vector_embed_id: vectorID,
						});
					}
				}
			}
		}

		if (evaluated.memoryTypes.semantic) {
			const semanticResult = await extractSemanticMemory(interaction);

			const parsed = semanticMemorySchema.safeParse(semanticResult);

			// if semantic results are valid we need to pass them through the filter that separates canonical truth
			if (semanticResult && parsed.success) {
				// get relationship from db
				const relationshipState = (await RelationshipStateModel.findOne({
					user_id: user_id,
				})) as RelationshipState;

				const isValid = evaluateBeliefTrust(semanticResult, relationshipState);

				// if allowed store in db
				if (isValid.allowed) {
					const text = buildEmbeddingText(semanticResult, "semantic");

					if (text.length) {
						const vectorEmbed = await generateEmbedding(text);

						if (vectorEmbed.length === VECTOR_SIZE) {
							// now save in vector db (qdrant)
							const vectorID = crypto.randomUUID();

							const qdrant_payload: QdrantPayload = {
								userID: user_id,
								type: "semantic",
							};

							await insertVector(
								vectorEmbed,
								"semantic_memories",
								vectorID,
								qdrant_payload,
							);

							// insert in mongodb
							await SemanticMemoryModel.create({
								...semanticResult,
								times_recalled: 0,
								createdAt: Date.now(),
								updatedAt: Date.now(),
								user_id: user_id,
								vector_embed_id: vectorID,
							});
						}
					}
				}
			}
		}

		// the following types are to be saved in db directly
		if (evaluated.memoryTypes.relationship) {
			const relationshipResult = await extractRelationshipMemory(interaction);

			// check using zod validation if the json is valid , meets our needs
			const parsed = relationshipMemorySchema.safeParse(relationshipResult);

			if (relationshipResult && parsed.success) {
				await RelationshipStateModel.findOneAndUpdate(
					{ user_id: user_id },
					{
						$set: {
							...relationshipResult,
							updatedAt: Date.now(),
							user_id: user_id,
						},
						$setOnInsert: { createdAt: Date.now() },
					},
					{ upsert: true, new: true },
				);
			}
		}

		if (evaluated.memoryTypes.reflectionCandidate) {
			const reflectionResult = await extractReflectionMemory(interaction);

			const parsed = reflectiveMemorySchema.safeParse(reflectionResult);

			if (reflectionResult && parsed.success) {
				await ReflectiveMemoryModel.create({
					...reflectionResult,
					updatedAt: Date.now(),
					user_id: user_id,
					createdAt: Date.now(),
				});
			}
		}
	} catch (err) {
		console.error("Error while running cognition pipeline : ", err);
	}
};
