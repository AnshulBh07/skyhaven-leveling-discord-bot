import { Client } from "discord.js";
import { attachGquestCollector } from "../../utils/gquestUtils";
import { IGquestMaze } from "../../utils/interfaces";
import GQuestMaze from "../../models/guildQuestsMazesSchema";

const execute = async (client: Client) => {
  try {
    const gquests = await GQuestMaze.find({ status: "pending" });

    // attach a collector on each one
    for (const gquest of gquests)
      await attachGquestCollector(client, gquest as IGquestMaze);
  } catch (err) {
    console.error("Error in gquest resume function : ", err);
  }
};

export default execute;
