"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const raidSchema_1 = __importDefault(require("../../models/raidSchema"));
const raidUtils_1 = require("../../utils/raidUtils");
const safeTimeout = (fn, delay) => {
    setTimeout(() => {
        fn().catch((err) => {
            console.error("Timer error:", err);
        });
    }, Math.max(1000, delay));
};
const fetchFreshRaid = (raid) => {
    return raidSchema_1.default.findOne({
        announcementMessageID: raid.announcementMessageID,
        serverID: raid.serverID,
    });
};
const execute = (client) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currTime = Date.now();
        const ongoingRaids = yield raidSchema_1.default.find({
            stage: {
                $ne: "completed",
            },
            "raidTimestamps.finishTime": 0,
        }).lean();
        const collectorTasks = [];
        for (const raid of ongoingRaids) {
            console.log("🔁 resuming raid:", raid.announcementMessageID);
            if (raid.raidTimestamps.startTime < currTime) {
                collectorTasks.push(raidSchema_1.default.updateOne({
                    _id: raid._id,
                }, {
                    $set: {
                        "raidTimestamps.finishTime": currTime,
                    },
                }));
                continue;
            }
            collectorTasks.push((0, raidUtils_1.attachRaidParticipationCollector)(client, raid));
            const startTime = raid.raidTimestamps.startTime;
            safeTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                const freshRaid = yield fetchFreshRaid(raid);
                if (freshRaid &&
                    (!freshRaid.bossBuffsImageUrl.length ||
                        !freshRaid.bossDebuffsImageUrl.length)) {
                    yield (0, raidUtils_1.sendScoutReminder)(client, freshRaid);
                }
            }), startTime - currTime - 24 * 60 * 60 * 1000);
            safeTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                const freshRaid = yield fetchFreshRaid(raid);
                if (freshRaid) {
                    yield (0, raidUtils_1.announceAllocation)(client, freshRaid);
                }
            }), startTime - currTime - 60 * 60 * 1000);
            safeTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                const freshRaid = yield fetchFreshRaid(raid);
                if (freshRaid) {
                    yield (0, raidUtils_1.raidRemindParticipants)(client, freshRaid);
                }
            }), startTime - currTime - 30 * 60 * 1000);
            safeTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                const freshRaid = yield raidSchema_1.default.findOneAndUpdate({
                    announcementMessageID: raid.announcementMessageID,
                    serverID: raid.serverID,
                }, {
                    $set: {
                        stage: "finished",
                        "raidTimestamps.finishTime": Date.now(),
                    },
                }, {
                    new: true,
                });
                if (freshRaid && !((_a = freshRaid.raidTimestamps) === null || _a === void 0 ? void 0 : _a.reviewTime)) {
                    yield (0, raidUtils_1.raidReviewReminder)(client, freshRaid);
                }
            }), startTime - currTime + 3 * 60 * 60 * 1000);
        }
        yield Promise.all(collectorTasks);
    }
    catch (err) {
        console.error("Error while resuming raids:", err);
    }
});
exports.default = execute;
