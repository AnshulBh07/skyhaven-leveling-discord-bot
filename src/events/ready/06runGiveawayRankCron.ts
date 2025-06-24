import { Client } from "discord.js";
import { scheduleGiveawayRankJob } from "../../jobs/cron/daily/giveawayRankCron";

const execute = async (client: Client) => {
  try {
    await scheduleGiveawayRankJob(client);
  } catch (err) {
    console.error(
      "Error while running giveaway rank cron on ready event : ",
      err
    );
  }
};

export default execute;
