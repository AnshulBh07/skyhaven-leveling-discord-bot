import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ContributorSchema = new Schema(
	{
		contributor_id: { type: String, required: true },
		contributor_name: { type: String, required: true },
		contribution_amount: { type: String, required: true },
		message: { type: String },
	},
	{ _id: false, _v: false, timestamps: false },
);

const CommunitySupportSchema = new Schema(
	{
		serverID: { type: String, default: "", required: true },
		hostID: { type: String, default: "", required: true },
		recipientID: { type: String, required: true },
		messageID: { type: String, unique: true, required: true, index: true },
		channelID: { type: String, default: "", required: true },
		threadID: { type: String, default: "", required: true },

		contribution_type: { type: String, default: "", required: true },
		reason: { type: String },
		contributors: { type: [ContributorSchema], default: [] },

		createdAt: { type: Number, required: true, default: Date.now },
		updatedAt: { type: Number, default: Date.now },
		isEnded: { type: Boolean, required: true, default: false },
	},
	{ timestamps: false },
);

CommunitySupportSchema.index({ threadID: 1 });

const CommunitySupport = mongoose.model(
	"CommunitySupport",
	CommunitySupportSchema,
);

export default CommunitySupport;
