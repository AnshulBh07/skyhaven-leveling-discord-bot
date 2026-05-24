import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv";
import { QdrantPayload } from "../utils/memoryArchitectureTypes";

const envFile = `.env.${process.env.NODE_ENV || "development"}`;

dotenv.config({ path: envFile });

export const qdrant = new QdrantClient({
	url: process.env.VECTOR_DB_URI!,
	apiKey: process.env.VECTOR_DB_KEY!,
	checkCompatibility: false,
});

export const VECTOR_SIZE = 768;

export const setupQdrant = async () => {
	try {
		const collections = await qdrant.getCollections();
		const existing = collections.collections.map((c) => c.name);

		if (!existing.includes("episodic_memories"))
			await qdrant.createCollection("episodic_memories", {
				vectors: {
					size: VECTOR_SIZE,
					distance: "Cosine",
				},
			});

		if (!existing.includes("semantic_memories"))
			await qdrant.createCollection("semantic_memories", {
				vectors: {
					size: VECTOR_SIZE,
					distance: "Cosine",
				},
			});
	} catch (err) {
		console.error("Error while setting up qdrant db : ", err);
	}
};

export const insertVector = async (
	embed: number[],
	collectionName: string,
	vectorID: string,
	payload: QdrantPayload,
) => {
	try {
		await qdrant.upsert(collectionName, {
			points: [{ id: vectorID, vector: embed, payload: payload }],
		});
	} catch (err) {
		console.error("Error while inserting in qdrant db : ", err);
	}
};

export const searchVector = async (
	embed: number[],
	user_id: string,
	collectionName: string,
) => {
	try {
		const results = await qdrant.search(collectionName, {
			vector: embed,
			limit: 15,
			filter: {
				must: [{ key: "userID", match: { value: user_id } }],
			},
		});

		return results
			? results
					.filter((r) => r.score >= 0.72)
					.map((r) => ({
						id: String(r.id),
						score: Number(r.score),
						payload: {
							userID: String(r.payload?.userID),
							type: r.payload?.type as "episodic" | "semantic",
						},
					}))
			: [];
	} catch (err) {
		console.error("Error while searching in qdrant vector db : ", err);
		return [];
	}
};
