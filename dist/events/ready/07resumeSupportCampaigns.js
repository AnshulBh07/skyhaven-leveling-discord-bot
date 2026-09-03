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
const communitySupportSchema_1 = __importDefault(require("../../models/communitySupportSchema"));
const communitySupportUtils_1 = require("../../utils/communitySupportUtils");
const execute = (client) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const campaigns = yield communitySupportSchema_1.default.find({ isEnded: false });
        const collectorTasks = [];
        for (const campaign of campaigns) {
            console.log("🔁 resuming support campaign : ", campaign.messageID);
            collectorTasks.push((0, communitySupportUtils_1.attachCommunitySupportCollector)(client, campaign));
        }
        yield Promise.all(collectorTasks);
    }
    catch (err) {
        console.error("Error while resuming support campaigns : ", err);
    }
});
exports.default = execute;
