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
exports.runCognition = void 0;
const embeddingsTextBuilder_1 = require("../utils/embeddingsTextBuilder");
const memoryEvaluation_1 = require("../utils/memoryEvaluation");
const memoryExtractors_1 = require("./memoryExtractors");
const semanticBeliefsFilter_1 = require("../utils/semanticBeliefsFilter");
const inferEpisodicMemory_1 = require("../zodValidation/inferEpisodicMemory");
const inferReflectionMemory_1 = require("../zodValidation/inferReflectionMemory");
const inferRelationshipState_1 = require("../zodValidation/inferRelationshipState");
const inferSemanticMemory_1 = require("../zodValidation/inferSemanticMemory");
const generateEmbedding_1 = require("./generateEmbedding");
const qdrant_1 = require("./qdrant");
const episodicMemorySchema_1 = __importDefault(require("../../models/cognition/episodicMemorySchema"));
const semanticMemorySchema_1 = __importDefault(require("../../models/cognition/semanticMemorySchema"));
const relationshipStateSchema_1 = __importDefault(require("../../models/cognition/relationshipStateSchema"));
const reflectiveMemorySchema_1 = __importDefault(require("../../models/cognition/reflectiveMemorySchema"));
const formRelationshipSate = (state) => {
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
const handleEpisodicMemory = (interaction, user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const episodicResult = yield (0, memoryExtractors_1.extractEpisodicMemory)(interaction);
        const parsed = inferEpisodicMemory_1.episodicMemorySchema.safeParse(episodicResult);
        if (episodicResult && parsed.success) {
            console.log("Extracted episodic memory ");
            const memory = parsed.data;
            // now that our LLM response is valid we will create embeddings for the result
            const text = (0, embeddingsTextBuilder_1.buildEmbeddingText)(memory, "episodic");
            if (text.trim().length) {
                const vectorEmbed = yield (0, generateEmbedding_1.generateEmbedding)(text);
                if (vectorEmbed.length === qdrant_1.VECTOR_SIZE) {
                    // now save in vector db (qdrant)
                    const vectorID = crypto.randomUUID();
                    const qdrant_payload = {
                        userID: user_id,
                        type: "episodic",
                    };
                    yield (0, qdrant_1.insertVector)(vectorEmbed, "episodic_memories", vectorID, qdrant_payload);
                    try {
                        yield episodicMemorySchema_1.default.create(Object.assign(Object.assign({}, memory), { times_recalled: 0, createdAt: Date.now(), updatedAt: Date.now(), user_id: user_id, vector_embed_id: vectorID }));
                    }
                    catch (mongoErr) {
                        console.error("MongoDB write failed for episodic memory; rolling back Qdrant vector:", mongoErr);
                        yield (0, qdrant_1.deleteVector)("episodic_memories", vectorID);
                        throw mongoErr;
                    }
                }
            }
        }
    }
    catch (err) {
        console.error("Error while handling episodic memory extraction and storage function : ", err);
    }
});
const handleSemanticMemory = (interaction, user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const semanticResult = yield (0, memoryExtractors_1.extractSemanticMemory)(interaction);
        const parsed = inferSemanticMemory_1.semanticMemorySchema.safeParse(semanticResult);
        // if semantic results are valid we need to pass them through the filter that separates canonical truth
        if (semanticResult && parsed.success) {
            console.log("Extracted semantic memory ");
            // get relationship from db
            const relationshipState = (yield relationshipStateSchema_1.default.findOne({
                user_id: user_id,
            })) || undefined;
            const isValid = (0, semanticBeliefsFilter_1.evaluateBeliefTrust)(semanticResult, relationshipState);
            // if allowed store in db
            if (isValid.allowed) {
                const text = (0, embeddingsTextBuilder_1.buildEmbeddingText)(semanticResult, "semantic");
                if (text.length) {
                    const vectorEmbed = yield (0, generateEmbedding_1.generateEmbedding)(text);
                    if (vectorEmbed.length === qdrant_1.VECTOR_SIZE) {
                        // now save in vector db (qdrant)
                        const vectorID = crypto.randomUUID();
                        const qdrant_payload = {
                            userID: user_id,
                            type: "semantic",
                        };
                        yield (0, qdrant_1.insertVector)(vectorEmbed, "semantic_memories", vectorID, qdrant_payload);
                        try {
                            yield semanticMemorySchema_1.default.create(Object.assign(Object.assign({}, semanticResult), { times_recalled: 0, createdAt: Date.now(), updatedAt: Date.now(), user_id: user_id, vector_embed_id: vectorID }));
                        }
                        catch (mongoErr) {
                            console.error("MongoDB write failed for semantic memory; rolling back Qdrant vector:", mongoErr);
                            yield (0, qdrant_1.deleteVector)("semantic_memories", vectorID);
                            throw mongoErr;
                        }
                    }
                }
            }
        }
    }
    catch (err) {
        console.error("Error while extracting and storing semantic memories : ", err);
    }
});
const handleRelationshipMemory = (interaction, user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // fetch and create old relationship state
        const oldState = yield relationshipStateSchema_1.default.findOne({
            user_id: user_id,
        });
        const oldStateString = formRelationshipSate(oldState);
        const relationshipResult = yield (0, memoryExtractors_1.extractRelationshipMemory)(interaction, oldStateString);
        // check using zod validation if the json is valid , meets our needs
        const parsed = inferRelationshipState_1.relationshipMemorySchema.safeParse(relationshipResult);
        if (relationshipResult && parsed.success) {
            console.log("Extracted relationship memory ");
            yield relationshipStateSchema_1.default.findOneAndUpdate({ user_id: user_id }, {
                $set: Object.assign(Object.assign({}, relationshipResult), { updatedAt: Date.now(), user_id: user_id }),
                $setOnInsert: { createdAt: Date.now() },
            }, { upsert: true, new: true });
        }
    }
    catch (err) {
        console.error("Error while storing and extracting relationship memory state : ", err);
    }
});
const handleReflectionMemory = (interaction, user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reflectionResult = yield (0, memoryExtractors_1.extractReflectionMemory)(interaction);
        const parsed = inferReflectionMemory_1.reflectiveMemorySchema.safeParse(reflectionResult);
        if (reflectionResult && parsed.success) {
            console.log("Extracted reflection memory ");
            yield reflectiveMemorySchema_1.default.create(Object.assign(Object.assign({}, reflectionResult), { updatedAt: Date.now(), user_id: user_id, createdAt: Date.now() }));
        }
    }
    catch (err) {
        console.error("Error while extracting and storing reflection memory : ", err);
    }
});
const runCognition = (interaction, user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // decide what type of memory it has to be
        const evaluated = yield (0, memoryEvaluation_1.evaluateMemory)(interaction);
        // console.log(evaluated);
        if (!evaluated || !evaluated.shouldCreateMemory)
            return;
        // let's make use of an async array for better aync orcestration, where we will identify async tasks that can take place, independently and group them together then use promise.all instead of await eveyrtime
        const cognitionTasks = [];
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
        yield Promise.all(cognitionTasks);
    }
    catch (err) {
        console.error("Error while running cognition pipeline : ", err);
    }
});
exports.runCognition = runCognition;
