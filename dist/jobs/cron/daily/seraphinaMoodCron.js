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
exports.scheduleSeraphinaMoodCron = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const configSchema_1 = __importDefault(require("../../../models/configSchema"));
const moodTemplates_1 = require("../../../data/moodTemplates");
const runSeraphinaMoodCronJob = (client) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // change her mood for all the guilds
        const guilds = yield configSchema_1.default.find();
        for (const guild of guilds) {
            const newMood = moodTemplates_1.moods[Math.floor(Math.random() * moodTemplates_1.moods.length)];
            console.log(`Changing Seraphina's mood to - ${newMood}`);
            guild.moodConfig.seraphinaMood = newMood;
            yield guild.save();
            // update her presence
            const msgArr = moodTemplates_1.seraphinaMoodDisplays[newMood].messages;
            const randomMsg = msgArr[Math.floor(Math.random() * msgArr.length)];
            if (!client.user)
                return;
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
    }
    catch (err) {
        console.error("Error while running seraphina mood cron : ", err);
    }
});
const scheduleSeraphinaMoodCron = (client) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // runs at 5 am everyday
        node_cron_1.default.schedule("0 5 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
            yield runSeraphinaMoodCronJob(client);
        }));
    }
    catch (err) {
        console.error("Error while scheduling seraphina mood cron : ", err);
    }
});
exports.scheduleSeraphinaMoodCron = scheduleSeraphinaMoodCron;
