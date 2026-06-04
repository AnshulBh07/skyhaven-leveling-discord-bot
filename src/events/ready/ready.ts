import { Client } from "discord.js";
import { processQueue } from "../../cognition/queues.ts/cognitionWorker";

const COGNITION_INTERVAL = 5 * 60 * 1000; // 5 minutes

const startCognitionLoop = async () => {
	try {
		await processQueue();
	} catch (err) {
		console.error("Cognition worker failed:", err);
	} finally {
		setTimeout(startCognitionLoop, COGNITION_INTERVAL);
	}
};

const execute = async (client: Client) => {
	if (!client.user) return;

	client.user.setPresence({
		status: "online",
		activities: [
			{
				name: "Server",
				type: 3,
			},
		],
	});

	console.log(`${client.user.username} bot is online.`);

	// Start background cognition loop
	void startCognitionLoop();
};

export default execute;
