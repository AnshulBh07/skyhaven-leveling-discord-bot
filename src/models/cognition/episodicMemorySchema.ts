import mongoose from "mongoose";
const Schema = mongoose.Schema;

const EmotionsSchema = new Schema(
	{
		curiosity: { type: Number },
		warmth: { type: Number },
		sadness: { type: Number },
		concern: { type: Number },
		attachment: { type: Number },
		admiration: { type: Number },
		existentialWeight: { type: Number },
	},
	{ timestamps: false, _id: false, _v: false },
);

const RelationshipImpactSchema = new Schema(
	{
		trustShift: { type: Number, required: true },
		attachmentShift: { type: Number, required: true },
		familiarityShift: { type: Number, required: true },
	},
	{ timestamps: false, _id: false, _v: false },
);

const MetaDataSchema = new Schema(
	{
		semanticWeight: { type: Number, required: true },
		emotionalWeight: { type: Number, required: true },
		narrativeWeight: { type: Number, required: true },
		relationshipWeight: { type: Number, required: true },
	},
	{ timestamps: false, _id: false, _v: false },
);

const EpisodicMemorySchema = new Schema(
	{
		memoryVersion: { type: Number, default: 1 },
		memorySource: {
			type: String,
			enum: [
				"direct_interaction",
				"reflection",
				"inference",
				"dream",
				"system_event",
			],
			required: true,
		},
		summary: { type: String, required: true },
		sceneDescription: { type: String, required: true },
		perspective: { type: String, required: true },
		emotionalTone: { type: String, required: true },
		emotions: {
			type: EmotionsSchema,
		},
		emotionalIntensity: { type: Number, required: true },
		internalResponse: { type: String, required: true },
		interpretedMeaning: { type: String, required: true },
		relationshipImpact: {
			type: RelationshipImpactSchema,
		},
		topics: { type: [String], deafult: [] },
		peopleInvolved: { type: [String], deafult: [] },
		significance: { type: Number, required: true },
		recallStrength: { type: Number, required: true },
		associatedMemories: { type: [String], deafult: [] },
		narrativeTags: { type: [String], deafult: [] },
		uncertainty: { type: Number, required: true },
		retrievalMetadata: {
			type: MetaDataSchema,
		},

		// db only fields
		user_id: { type: String, required: true, unique: true, index: true },
		createdAt: { type: Number, required: true, default: Date.now() },
		updatedAt: { type: Number, required: true, default: Date.now() },
		times_recalled: { type: Number, required: true },
		last_recalled: { type: Number },
		vector_embed_id: { type: String },
	},
	{ timestamps: false, _v: false },
);

const EpisodicMemoryModel = mongoose.model(
	"EpisodicMemoryModel",
	EpisodicMemorySchema,
);

export default EpisodicMemoryModel;
