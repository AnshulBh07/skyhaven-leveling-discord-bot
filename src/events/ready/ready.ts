import { Client } from "discord.js";
import { processQueue } from "../../cognition/queues.ts/cognitionWorker";

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

	// run cognition in background continuously this mimics human brain
	setInterval(() => {
		processQueue();
	}, 5000);
};

export default execute;
