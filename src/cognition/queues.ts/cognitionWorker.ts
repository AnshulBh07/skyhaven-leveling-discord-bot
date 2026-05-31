import { runCognition } from "../vector/runCognition";
import { CognitionQueue } from "./cognitionQueue";

let isProcessing = false;

export const processQueue = async () => {
	if (isProcessing) return;

	// shift onto next job if not processing
	const job = CognitionQueue.shift();

	if (!job) return;

	try {
		console.log(`🧠 Processing cognition job ${job.id}`);
		await runCognition(job.interaction, job.userId);
	} catch (err) {
		console.error(`Cognition failed, skipping job ${job.id} : `, err);
	} finally {
		isProcessing = false;
	}
};
