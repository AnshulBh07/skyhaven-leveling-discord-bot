import { Client } from "discord.js";
import { IGquest } from "../../utils/interfaces";
import GQuest from "../../models/guildQuestsSchema";
import { attachQuestMazeReviewCollector } from "../../utils/gquestUtils";

const resumeGquest = async (client: Client, gquest: IGquest) => {
	try {
		console.log(`🔁 resuming gquest : `, gquest.messageID);
		await attachQuestMazeReviewCollector(client, gquest, "gq");
	} catch (err) {
		console.error(`Error while resuming gquest ${gquest.messageID} : `, err);
	}
};

const execute = async (client: Client) => {
	try {
		const gquests = await GQuest.find({ status: "pending" });

		const resumeGquestsArr: Promise<any>[] = [];

		// attach a collector on each one
		for (const gquest of gquests) {
			resumeGquestsArr.push(resumeGquest(client, gquest as IGquest));
		}

		await Promise.allSettled(resumeGquestsArr);
	} catch (err) {
		console.error("Error in gquest resume function : ", err);
	}
};

export default execute;
