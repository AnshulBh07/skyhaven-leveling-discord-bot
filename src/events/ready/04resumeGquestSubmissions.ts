import { Client } from "discord.js";
import GQuest from "../../models/guildQuestsSchema";
import { attachGquestCollector } from "../../utils/gquestUtils";
import { IGquest } from "../../utils/interfaces";

const execute = async (client: Client) => {
  try {
    const gquests = await GQuest.find({ status: "pending" });

    // attach a collector on each one
    for (const gquest of gquests)
      await attachGquestCollector(client, gquest as IGquest);
  } catch (err) {
    console.error("Error in gquest resume function : ", err);
  }
};

export default execute;
