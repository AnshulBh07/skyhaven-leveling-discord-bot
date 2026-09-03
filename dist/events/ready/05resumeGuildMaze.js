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
const mazeSchema_1 = __importDefault(require("../../models/mazeSchema"));
const mazeUtils_1 = require("../../utils/mazeUtils");
const gquestUtils_1 = require("../../utils/gquestUtils");
const execute = (client) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mazes = yield mazeSchema_1.default.find({ status: "pending" });
        const resumeMazeThreadCollectors = [], resumeMazeReviewCollectors = [];
        for (const maze of mazes) {
            console.log("🔁 resuming maze : ", maze.messageID);
            // continue thread if non archived
            // attach fresh button collectors on message
            resumeMazeThreadCollectors.push((0, mazeUtils_1.attachMazeThreadCollector)(client, maze.submissionThreadID));
            resumeMazeReviewCollectors.push((0, gquestUtils_1.attachQuestMazeReviewCollector)(client, maze, "mz"));
        }
        yield Promise.all([
            ...resumeMazeThreadCollectors,
            ...resumeMazeReviewCollectors,
        ]);
    }
    catch (err) {
        console.error("Error while resuming mazes : ", err);
    }
});
exports.default = execute;
