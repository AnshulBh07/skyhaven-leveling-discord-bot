import { Client } from "discord.js";
import Raid from "../../models/raidSchema";
import {
	announceAllocation,
	attachRaidParticipationCollector,
	raidRemindParticipants,
	raidReviewReminder,
	sendScoutReminder,
} from "../../utils/raidUtils";
import { IRaid } from "../../utils/interfaces";

const safeTimeout = (fn: () => Promise<void>, delay: number) => {
	setTimeout(
		() => {
			fn().catch((err) => {
				console.error("Timer error:", err);
			});
		},
		Math.max(1000, delay),
	);
};

const fetchFreshRaid = (raid: IRaid) => {
	return Raid.findOne({
		announcementMessageID: raid.announcementMessageID,

		serverID: raid.serverID,
	});
};

const execute = async (client: Client) => {
	try {
		const currTime = Date.now();

		const ongoingRaids = await Raid.find({
			stage: {
				$ne: "completed",
			},

			"raidTimestamps.finishTime": 0,
		}).lean();

		const collectorTasks: Promise<unknown>[] = [];

		for (const raid of ongoingRaids) {
			console.log("🔁 resuming raid:", raid.announcementMessageID);

			if (raid.raidTimestamps.startTime < currTime) {
				collectorTasks.push(
					Raid.updateOne(
						{
							_id: raid._id,
						},
						{
							$set: {
								"raidTimestamps.finishTime": currTime,
							},
						},
					),
				);

				continue;
			}

			collectorTasks.push(
				attachRaidParticipationCollector(client, raid as IRaid),
			);

			const startTime = raid.raidTimestamps.startTime;

			safeTimeout(
				async () => {
					const freshRaid = await fetchFreshRaid(raid as IRaid);

					if (
						freshRaid &&
						(!freshRaid.bossBuffsImageUrl.length ||
							!freshRaid.bossDebuffsImageUrl.length)
					) {
						await sendScoutReminder(client, freshRaid as IRaid);
					}
				},

				startTime - currTime - 24 * 60 * 60 * 1000,
			);

			safeTimeout(
				async () => {
					const freshRaid = await fetchFreshRaid(raid as IRaid);

					if (freshRaid) {
						await announceAllocation(client, freshRaid as IRaid);
					}
				},

				startTime - currTime - 60 * 60 * 1000,
			);

			safeTimeout(
				async () => {
					const freshRaid = await fetchFreshRaid(raid as IRaid);

					if (freshRaid) {
						await raidRemindParticipants(client, freshRaid as IRaid);
					}
				},

				startTime - currTime - 30 * 60 * 1000,
			);

			safeTimeout(
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

						{
							new: true,
						},
					);

					if (freshRaid && !freshRaid.raidTimestamps?.reviewTime) {
						await raidReviewReminder(client, freshRaid as IRaid);
					}
				},

				startTime - currTime + 3 * 60 * 60 * 1000,
			);
		}

		await Promise.all(collectorTasks);
	} catch (err) {
		console.error("Error while resuming raids:", err);
	}
};

export default execute;
