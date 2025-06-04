import { Client } from "discord.js";
import Giveaway from "../../models/giveawaySchema";
import { attachCollector, endGiveaway } from "../../utils/giveawayUtils";

// this file resumes all pendiong giveaways from db
const execute = async (client: Client) => {
  try {
    // fetch all giveawyas from db first
    const giveaways = await Giveaway.find();

    for (const giveaway of giveaways) {
      // skip already ended giveaways
      if (giveaway.isEnded) continue;

      const timeLeft = giveaway.endsAt - Date.now();
      // end all pending giveaways
      if (timeLeft <= 0) await endGiveaway(client, giveaway.messageID);
      else {
        console.log("Resuming giveaway : ", giveaway.messageID);
        // schedule the giveaway again
        const collector = await attachCollector(client, giveaway);
        if (collector)
          setTimeout(async () => {
            collector.stop();
            // to avoid fetching stale state from db fetch a fresh one
            const freshGiveaway = await Giveaway.findOne({
              messageID: giveaway.messageID,
            });

            if (!freshGiveaway) return;

            await endGiveaway(client, freshGiveaway.messageID);
          }, timeLeft);
      }
    }
  } catch (err) {
    console.error("Error in resume giveaways fired at ready event :", err);
  }
};

export default execute;
