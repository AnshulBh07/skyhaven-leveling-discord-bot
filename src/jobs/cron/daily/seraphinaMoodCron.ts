import { Client } from "discord.js";
import cron from "node-cron";
import Config from "../../../models/configSchema";
import { moods, seraphinaMoodDisplays } from "../../../data/moodTemplates";

const runSeraphinaMoodCronJob = async (client: Client) => {
  try {
    // change her mood for all the guilds
    const guilds = await Config.find();

    for (const guild of guilds) {
      const newMood = moods[Math.floor(Math.random() * moods.length)];

      console.log(`Changing Seraphina's mood to - ${newMood}`);

      guild.moodConfig.seraphinaMood = newMood;
      await guild.save();

      // update her presence
      const msgArr = seraphinaMoodDisplays[newMood].messages;
      const randomMsg = msgArr[Math.floor(Math.random() * msgArr.length)];

      if (!client.user) return;

      client.user.setPresence({
        status: "online",
        activities: [
          {
            name: randomMsg.text,
            type: randomMsg.type,
          },
        ],
      });
    }
  } catch (err) {
    console.error("Error while running seraphina mood cron : ", err);
  }
};

export const scheduleSeraphinaMoodCron = async (client: Client) => {
  try {
    cron.schedule("0 */6 * * *", async () => {
      await runSeraphinaMoodCronJob(client);
    });
  } catch (err) {
    console.error("Error while scheduling seraphina mood cron : ", err);
  }
};
