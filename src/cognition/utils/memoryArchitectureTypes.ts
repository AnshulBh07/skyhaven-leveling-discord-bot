export interface MemoryEvaluation {
	shouldCreateMemory: boolean;
	reason: string;
	memoryTypes: {
		episodic: boolean;
		semantic: boolean;
		relationship: boolean;
		reflectionCandidate: boolean;
	};
	emotionalSignificance: number;
	narrativeSignificance: number;
	relationshipSignificance: number;
}

// refer to their respective pdfs for explanantion of each field
// this is the response we get from llm call
export interface EpisodicMemory {
	memoryVersion: number;
	memorySource:
		| "direct_interaction"
		| "reflection"
		| "inference"
		| "dream"
		| "system_event";
	summary: string;
	sceneDescription: string;
	perspective: string;
	emotionalTone: string;
	emotions: {
		curiosity?: number;
		warmth?: number;
		sadness?: number;
		concern?: number;
		attachment?: number;
		admiration?: number;
		existentialWeight?: number;
	};
	emotionalIntensity: number;
	internalResponse: string;
	interpretedMeaning: string;
	relationshipImpact: {
		trustShift: number;
		attachmentShift: number;
		familiarityShift: number;
	};
	topics: string[];
	peopleInvolved: string[];
	significance: number;
	recallStrength: number;
	associatedMemories: string[];
	narrativeTags: string[];
	uncertainty: number;
	retrievalMetadata: {
		semanticWeight: number;
		emotionalWeight: number;
		narrativeWeight: number;
		relationshipWeight: number;
	};
}

export interface StoredEpisodicMemory extends EpisodicMemory {
	user_id: string;
	createdAt: number;
	updatedAt: number;
	times_recalled: number;
	last_recalled?: number;
	vector_embed_id?: string;
}

export interface RelationshipState {
	overallImpression: string;
	emotionalAssociations: string[];
	perceivedTraits: string[];
	communicationPatterns: string[];
	attachmentLevel: number;
	trustLevel: number;
	familiarityLevel: number;
	emotionalSafety: number;
	recurringDynamics: string[];
	insideJokes: string[];
	unresolvedTensions: string[];
	behavioralExpectations: string[];
	lastInteractionSummary: string;
	relationshipNarrative: string;
}

export interface StoredRelationshipMemory extends RelationshipState {
	user_id: string;
	createdAt: number;
	updatedAt: number;
}

export interface ReflectiveMemory {
	triggerEvent: string;
	reflection: string;
	selfObservation: string;
	behavioralAdjustment: string;
	emotionalEffect: string;
	confidence: number;
	relatedMemories: string[];
	personalityImpact: {
		curiosity?: number;
		warmth?: number;
		protectiveness?: number;
		philosophical?: number;
	};
}

export interface StoredReflectionMemory extends ReflectiveMemory {
	user_id: string;
	createdAt: number;
	updatedAt: number;
}

export interface SemanticMemory {
	memoryVersion: number;
	source: "direct_statement" | "repeated_pattern" | "inference";
	category:
		| "identity"
		| "preference"
		| "project"
		| "relationship"
		| "belief"
		| "interest"
		| "routine"
		| "life_event";
	statement: string;
	confidence: number;
	stability: number;
	significance: number;
	topics: string[];
	relatedEntities: string[];
	emotionalIntensity: number;
	recallStrength: number;
}

export interface StoredSemanticMemory extends SemanticMemory {
	user_id: string;
	createdAt: number;
	updatedAt: number;
	times_recalled: number;
	last_recalled?: number;
	vector_embed_id?: string;
}

export type QdrantPayload = {
	userID: string;
	type: "episodic" | "semantic";
};

export interface IQdrantRetrieved {
	id: string;
	score: number;
	payload: QdrantPayload;
}

export interface MappedEpisodicMemory extends StoredEpisodicMemory {
	finalScore: number;
}

export interface MappedSemanticMemory extends StoredSemanticMemory {
	finalScore: number;
}
