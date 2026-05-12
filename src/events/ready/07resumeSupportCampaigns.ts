import { Client } from "discord.js";
import CommunitySupport from "../../models/communitySupportSchema";
import { attachCommunitySupportCollector } from "../../utils/communitySupportUtils";
import { ICommunitySupport } from "../../utils/interfaces";

const execute = async (client: Client) => {
	try {
		const campaigns = await CommunitySupport.find({ isEnded: false });

		for (const campaign of campaigns) {
			console.log("🔁 resuming support campaign : ", campaign.messageID);

			await attachCommunitySupportCollector(
				client,
				campaign as ICommunitySupport,
			);
		}
	} catch (err) {
		console.error("Error while resuming support campaigns : ", err);
	}
};

export default execute;
