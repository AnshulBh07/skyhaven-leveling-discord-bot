import { Client } from "discord.js";
import CommunitySupport from "../../models/communitySupportSchema";
import { attachCommunitySupportCollector } from "../../utils/communitySupportUtils";
import { ICommunitySupport } from "../../utils/interfaces";

const execute = async (client: Client) => {
	try {
		const campaigns = await CommunitySupport.find({ isEnded: false });

		const collectorTasks: Promise<unknown>[] = [];

		for (const campaign of campaigns) {
			console.log("🔁 resuming support campaign : ", campaign.messageID);

			collectorTasks.push(
				attachCommunitySupportCollector(client, campaign as ICommunitySupport),
			);
		}

		await Promise.allSettled(collectorTasks);
	} catch (err) {
		console.error("Error while resuming support campaigns : ", err);
	}
};

export default execute;
