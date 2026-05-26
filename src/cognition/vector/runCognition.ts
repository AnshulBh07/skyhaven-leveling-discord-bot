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
	StoredRelationshipMemory,
} from "../utils/memoryArchitectureTypes";
import EpisodicMemoryModel from "../../models/cognition/episodicMemorySchema";
import SemanticMemoryModel from "../../models/cognition/semanticMemorySchema";
import RelationshipStateModel from "../../models/cognition/relationshipStateSchema";
import ReflectiveMemoryModel from "../../models/cognition/reflectiveMemorySchema";

const formRelationshipSate = (state: StoredRelationshipMemory | null) => {
	if (!state)
		return "User is a fresh user and has no old relationship with Seraphina";

	return `
		Existing Relationship State

		Overall Impression:
		${state.overallImpression}

		Emotional Associations:
		${state.emotionalAssociations.join(", ")}

		Perceived Traits:
		${state.perceivedTraits.join(", ")}

		Communication Patterns:
		${state.communicationPatterns.join(", ")}

		Attachment Level:
		${state.attachmentLevel.toFixed(2)}

		Trust Level:
		${state.trustLevel.toFixed(2)}

		Familiarity Level:
		${state.familiarityLevel.toFixed(2)}

		Emotional Safety:
		${state.emotionalSafety.toFixed(2)}

		Recurring Dynamics:
		${state.recurringDynamics.join(", ")}

		Inside Jokes:
		${state.insideJokes.join(", ")}

		Unresolved Tensions:
		${state.unresolvedTensions.join(", ")}

		Behavioral Expectations:
		${state.behavioralExpectations.join(", ")}

		Last Interaction Summary:
		${state.lastInteractionSummary}

		Relationship Narrative:
		${state.relationshipNarrative}
	`;
};

const handleEpisodicMemory = async (interaction: string, user_id: string) => {
	try {
		const episodicResult = await extractEpisodicMemory(interaction);

		const parsed = episodicMemorySchema.safeParse(episodicResult);

		if (episodicResult && parsed.success) {
			console.log("Extracted episodic memory ");
			const memory = parsed.data;

			// now that our LLM response is valid we will create embeddings for the result
			const text = buildEmbeddingText(memory, "episodic");

			if (text.trim().length) {
				const vectorEmbed = await generateEmbedding(text);

				if (vectorEmbed.length === VECTOR_SIZE) {
					// now save in vector db (qdrant)
					const vectorID = crypto.randomUUID();

					const qdrant_payload: QdrantPayload = {
						userID: user_id,
						type: "episodic",
					};

					await Promise.all([
						insertVector(
							vectorEmbed,
							"episodic_memories",
							vectorID,
							qdrant_payload,
						),
						EpisodicMemoryModel.create({
							...memory,
							times_recalled: 0,
							createdAt: Date.now(),
							updatedAt: Date.now(),
							user_id: user_id,
							vector_embed_id: vectorID,
						}),
					]);
				}
			}
		}
	} catch (err) {
		console.error(
			"Error while handling episodic memory extraction and storage function : ",
			err,
		);
	}
};

const handleSemanticMemory = async (interaction: string, user_id: string) => {
	try {
		const semanticResult = await extractSemanticMemory(interaction);

		const parsed = semanticMemorySchema.safeParse(semanticResult);

		// if semantic results are valid we need to pass them through the filter that separates canonical truth
		if (semanticResult && parsed.success) {
			console.log("Extracted semantic memory ");
			// get relationship from db
			const relationshipState =
				(await RelationshipStateModel.findOne({
					user_id: user_id,
				})) || undefined;

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

						await Promise.all([
							insertVector(
								vectorEmbed,
								"semantic_memories",
								vectorID,
								qdrant_payload,
							),
							SemanticMemoryModel.create({
								...semanticResult,
								times_recalled: 0,
								createdAt: Date.now(),
								updatedAt: Date.now(),
								user_id: user_id,
								vector_embed_id: vectorID,
							}),
						]);
					}
				}
			}
		}
	} catch (err) {
		console.error(
			"Error while extracting and storing semantic memories : ",
			err,
		);
	}
};

const handleRelationshipMemory = async (
	interaction: string,
	user_id: string,
) => {
	try {
		// fetch and create old relationship state
		const oldState = await RelationshipStateModel.findOne({
			user_id: user_id,
		});

		const oldStateString = formRelationshipSate(oldState);

		const relationshipResult = await extractRelationshipMemory(
			interaction,
			oldStateString,
		);

		// check using zod validation if the json is valid , meets our needs
		const parsed = relationshipMemorySchema.safeParse(relationshipResult);

		if (relationshipResult && parsed.success) {
			console.log("Extracted relationship memory ");
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
	} catch (err) {
		console.error(
			"Error while storing and extracting relationship memory state : ",
			err,
		);
	}
};

const handleReflectionMemory = async (interaction: string, user_id: string) => {
	try {
		const reflectionResult = await extractReflectionMemory(interaction);

		const parsed = reflectiveMemorySchema.safeParse(reflectionResult);

		if (reflectionResult && parsed.success) {
			console.log("Extracted reflection memory ");

			await ReflectiveMemoryModel.create({
				...reflectionResult,
				updatedAt: Date.now(),
				user_id: user_id,
				createdAt: Date.now(),
			});
		}
	} catch (err) {
		console.error(
			"Error while extracting and storing reflection memory : ",
			err,
		);
	}
};

export const runCognition = async (interaction: string, user_id: string) => {
	try {
		// decide what type of memory it has to be
		const evaluated = await evaluateMemory(interaction);

		console.log(evaluated);

		if (!evaluated || !evaluated.shouldCreateMemory) return;

		// let's make use of an async array for better aync orcestration, where we will identify async tasks that can take place, independently and group them together then use promise.all instead of await eveyrtime
		const cognitionTasks: Promise<any>[] = [];

		// work depending on type of memorry
		if (evaluated.memoryTypes.episodic) {
			cognitionTasks.push(handleEpisodicMemory(interaction, user_id));
		}

		if (evaluated.memoryTypes.semantic) {
			cognitionTasks.push(handleSemanticMemory(interaction, user_id));
		}

		// the following types are to be saved in db directly
		if (evaluated.memoryTypes.relationship) {
			cognitionTasks.push(handleRelationshipMemory(interaction, user_id));
		}

		if (evaluated.memoryTypes.reflectionCandidate) {
			cognitionTasks.push(handleReflectionMemory(interaction, user_id));
		}

		await Promise.allSettled(cognitionTasks);
	} catch (err) {
		console.error("Error while running cognition pipeline : ", err);
	}
};
