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
const guildQuestsSchema_1 = __importDefault(require("../../models/guildQuestsSchema"));
const gquestUtils_1 = require("../../utils/gquestUtils");
const resumeGquest = (client, gquest) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(`🔁 resuming gquest : `, gquest.messageID);
        yield (0, gquestUtils_1.attachQuestMazeReviewCollector)(client, gquest, "gq");
    }
    catch (err) {
        console.error(`Error while resuming gquest ${gquest.messageID} : `, err);
    }
});
const execute = (client) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const gquests = yield guildQuestsSchema_1.default.find({ status: "pending" });
        const resumeGquestsArr = [];
        // attach a collector on each one
        for (const gquest of gquests) {
            resumeGquestsArr.push(resumeGquest(client, gquest));
        }
        yield Promise.all(resumeGquestsArr);
    }
    catch (err) {
        console.error("Error in gquest resume function : ", err);
    }
});
exports.default = execute;
