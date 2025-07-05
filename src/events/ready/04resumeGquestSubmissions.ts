import { Client } from "discord.js";
import { IGquest } from "../../utils/interfaces";
import GQuest from "../../models/guildQuestsSchema";
import { attachQuestMazeReviewCollector } from "../../utils/gquestUtils";

const execute = async (client: Client) => {
  try {
    const gquests = await GQuest.find({ status: "pending" });

    // attach a collector on each one
    for (const gquest of gquests) {
      console.log(`🔁 resuming gquest : `, gquest.messageID);
      await attachQuestMazeReviewCollector(client, gquest as IGquest, "gq");
    }
  } catch (err) {
    console.error("Error in gquest resume function : ", err);
  }
};

export default execute;
