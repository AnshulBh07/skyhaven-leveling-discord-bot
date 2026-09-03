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
Object.defineProperty(exports, "__esModule", { value: true });
const giveawayRankCron_1 = require("../../jobs/cron/daily/giveawayRankCron");
const seraphinaMoodCron_1 = require("../../jobs/cron/daily/seraphinaMoodCron");
const execute = (client) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Promise.all([
            (0, giveawayRankCron_1.scheduleGiveawayRankJob)(client),
            (0, seraphinaMoodCron_1.scheduleSeraphinaMoodCron)(client),
        ]);
    }
    catch (err) {
        console.error("Error while running cron jobs : ", err);
    }
});
exports.default = execute;
