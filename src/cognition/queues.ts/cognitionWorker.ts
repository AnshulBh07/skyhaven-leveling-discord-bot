import { runCognition } from "../vector/runCognition";
import { CognitionQueue } from "./cognitionQueue";

let isProcessing = false;

export const processQueue = async () => {
	if (isProcessing) return;

	isProcessing = true;

	try {
		while (CognitionQueue.length > 0) {
			const job = CognitionQueue.shift();
			if (!job) break;

			try {
				console.log(`🧠 Processing cognition job ${job.id}`);
				await runCognition(job.interaction, job.userId);
			} catch (err) {
				console.error(`Cognition failed, skipping job ${job.id} : `, err);
			}
		}
	} finally {
		isProcessing = false;
	}
};
