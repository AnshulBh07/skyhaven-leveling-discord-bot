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
const giveawaySchema_1 = __importDefault(require("../../models/giveawaySchema"));
const giveawayUtils_1 = require("../../utils/giveawayUtils");
const resumeGa = (client, giveaway) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const timeLeft = giveaway.endsAt - Date.now();
        console.log("🔁 resuming giveaway : ", giveaway.messageID);
        // schedule the giveaway again
        const collector = yield (0, giveawayUtils_1.attachCollector)(client, giveaway);
        if (collector)
            setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                collector.stop();
                // to avoid fetching stale state from db fetch a fresh one
                const freshGiveaway = yield giveawaySchema_1.default.findOne({
                    messageID: giveaway.messageID,
                });
                if (!freshGiveaway)
                    return;
                yield (0, giveawayUtils_1.endGiveaway)(client, freshGiveaway.messageID);
            }), Math.max(0, timeLeft));
    }
    catch (err) {
        console.error("Error while resuming giveaway : ", err);
    }
});
// this file resumes all pendiong giveaways from db
const execute = (client) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // fetch all giveawyas from db first
        const giveaways = yield giveawaySchema_1.default.find().lean();
        const giveawaysEnd = [];
        const giveawaysResume = [];
        for (const giveaway of giveaways) {
            // skip already ended giveaways
            if (giveaway.isEnded)
                continue;
            const timeLeft = giveaway.endsAt - Date.now();
            // end all pending giveaways
            if (timeLeft <= 0)
                giveawaysEnd.push((0, giveawayUtils_1.endGiveaway)(client, giveaway.messageID));
            else {
                giveawaysResume.push(resumeGa(client, giveaway));
            }
        }
        yield Promise.all([...giveawaysResume, ...giveawaysEnd]);
    }
    catch (err) {
        console.error("Error in resume giveaways fired at ready event :", err);
    }
});
exports.default = execute;
