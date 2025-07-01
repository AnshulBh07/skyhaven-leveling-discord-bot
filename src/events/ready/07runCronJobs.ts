import { Client } from "discord.js";
import { scheduleGiveawayRankJob } from "../../jobs/cron/daily/giveawayRankCron";
import { scheduleSeraphinaMoodCron } from "../../jobs/cron/daily/seraphinaMoodCron";

const execute = async (client: Client) => {
  try {
    await scheduleGiveawayRankJob(client);
    await scheduleSeraphinaMoodCron(client);
  } catch (err) {
    console.error(
      "Error while running cron jobs : ",
      err
    );
  }
};

export default execute;
