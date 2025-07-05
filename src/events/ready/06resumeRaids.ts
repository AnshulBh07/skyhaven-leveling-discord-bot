import { Client } from "discord.js";
import Raid from "../../models/raidSchema";
import {
  announceAllocation,
  raidRemindParticipants,
  raidReviewReminder,
  sendScoutReminder,
} from "../../utils/raidUtils";
import { IRaid } from "../../utils/interfaces";

const execute = async (client: Client) => {
  try {
    const currTime = Date.now();

    // fetch all ongoing raids
    const ongoinRaids = await Raid.find({
      stage: { $ne: "completed" },
      "raidTimestamps.finishTime": null,
    });

    for (const raid of ongoinRaids) {
      console.log("🔁 resuming raid : ", raid.announcementMessageID);
      // if the currtime is more than raid startTime and it is unfinished, simply finish it, this
      // raid won't contribute to any of the scores for user
      if (raid.raidTimestamps.startTime < currTime) {
        raid.raidTimestamps.finishTime = currTime;
        await raid.save();
        continue;
      }

      const startTime = raid.raidTimestamps.startTime;

      const scoutRemindTime = startTime - currTime - 24 * 60 * 60 * 1000;
      const allocationTime = startTime - currTime - 60 * 60 * 1000;
      const remindParticipantsTime = startTime - currTime - 30 * 60 * 1000;
      const reviewReminder = startTime - currTime + 3 * 60 * 60 * 1000;

      const scoutTimers = new Set<string>(),
        allocationTimers = new Set<string>(),
        reminderTimers = new Set<string>(),
        reviewTimers = new Set<string>();

      if (!scoutTimers.has(raid.announcementMessageID)) {
        scoutTimers.add(raid.announcementMessageID);

        setTimeout(
          async () => {
            try {
              const freshRaid = await Raid.findOne({
                announcementMessageID: raid.announcementMessageID,
                serverID: raid.serverID,
              });

              if (
                freshRaid &&
                (!freshRaid.bossBuffsImageUrl.length ||
                  !freshRaid.bossDebuffsImageUrl.length)
              )
                await sendScoutReminder(client, freshRaid as IRaid);
            } catch (err) {
              console.error("Error in scout reminder timer : ", err);
            }
          },
          scoutRemindTime < 0 ? 1000 : scoutRemindTime
        );
      }

      if (!allocationTimers.has(raid.announcementMessageID)) {
        allocationTimers.add(raid.announcementMessageID);

        // allocate teams and send a message, do this 1 hr before raid
        setTimeout(
          async () => {
            try {
              const freshRaid = await Raid.findOne({
                announcementMessageID: raid.announcementMessageID,
                serverID: raid.serverID,
              });

              if (freshRaid)
                await announceAllocation(client, freshRaid as IRaid);
            } catch (err) {
              console.error("Error in team allocation timer : ", err);
            }
          },
          allocationTime < 0 ? 1000 : allocationTime
        );
      }

      if (!reminderTimers.has(raid.announcementMessageID)) {
        reminderTimers.add(raid.announcementMessageID);

        // send a reminder to all participants 30 minutes before raid
        setTimeout(
          async () => {
            try {
              const freshRaid = await Raid.findOne({
                announcementMessageID: raid.announcementMessageID,
                serverID: raid.serverID,
              });

              if (freshRaid)
                await raidRemindParticipants(client, freshRaid as IRaid);
            } catch (err) {
              console.error("Error in raid reminder timer : ", err);
            }
          },
          remindParticipantsTime < 0 ? 1000 : remindParticipantsTime
        );
      }

      if (!reviewTimers.has(raid.announcementMessageID)) {
        reviewTimers.add(raid.announcementMessageID);

        // timer for sending a review reminder, do this 3 hour after raid
        setTimeout(
          async () => {
            const freshRaid = await Raid.findOneAndUpdate(
              {
                announcementMessageID: raid.announcementMessageID,
                serverID: raid.serverID,
              },
              {
                $set: {
                  stage: "finished",
                  "raidTimestamps.finishTime": Date.now(),
                },
              },
              { new: true }
            );

            if (freshRaid && !freshRaid.raidTimestamps?.reviewTime)
              await raidReviewReminder(client, freshRaid as IRaid);
          },
          reviewReminder < 0 ? 1000 : reviewReminder
        );
      }
    }
  } catch (err) {
    console.error("Error while resuming raid on ready event : ", err);
  }
};

export default execute;
