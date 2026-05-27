import { Client } from "discord.js";
import Giveaway from "../../models/giveawaySchema";
import { attachCollector, endGiveaway } from "../../utils/giveawayUtils";
import { IGiveaway } from "../../utils/interfaces";

const resumeGa = async (client: Client, giveaway: IGiveaway) => {
	try {
		const timeLeft = giveaway.endsAt - Date.now();

		console.log("🔁 resuming giveaway : ", giveaway.messageID);
		// schedule the giveaway again
		const collector = await attachCollector(client, giveaway);
		if (collector)
			setTimeout(
				async () => {
					collector.stop();
					// to avoid fetching stale state from db fetch a fresh one
					const freshGiveaway = await Giveaway.findOne({
						messageID: giveaway.messageID,
					});

					if (!freshGiveaway) return;

					await endGiveaway(client, freshGiveaway.messageID);
				},
				Math.max(0, timeLeft),
			);
	} catch (err) {
		console.error("Error while resuming giveaway : ", err);
	}
};

// this file resumes all pendiong giveaways from db
const execute = async (client: Client) => {
	try {
		// fetch all giveawyas from db first
		const giveaways = await Giveaway.find().lean();

		const giveawaysEnd: Promise<any>[] = [];
		const giveawaysResume: Promise<any>[] = [];

		for (const giveaway of giveaways) {
			// skip already ended giveaways
			if (giveaway.isEnded) continue;

			const timeLeft = giveaway.endsAt - Date.now();
			// end all pending giveaways
			if (timeLeft <= 0)
				giveawaysEnd.push(endGiveaway(client, giveaway.messageID));
			else {
				giveawaysResume.push(resumeGa(client, giveaway));
			}
		}

		await Promise.allSettled([...giveawaysResume, ...giveawaysResume]);
	} catch (err) {
		console.error("Error in resume giveaways fired at ready event :", err);
	}
};

export default execute;
