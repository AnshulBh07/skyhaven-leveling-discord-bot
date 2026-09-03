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
exports.getStaticCanvasAssets = void 0;
const path_1 = __importDefault(require("path"));
const canvas_1 = require("canvas");
const getAllFiles_1 = __importDefault(require("../../utils/getAllFiles"));
let cachedAssets = null;
const getStaticCanvasAssets = () => __awaiter(void 0, void 0, void 0, function* () {
    if (cachedAssets)
        return cachedAssets;
    const logosDir = path_1.default.join(__dirname, "../..", "assets/logos");
    const defaultPfpDir = path_1.default.join(__dirname, "../..", "assets/images/default_pfp");
    const lbBgDir = path_1.default.join(__dirname, "../..", "assets/images/leaderboard_bg");
    const qmBgDir = path_1.default.join(__dirname, "../..", "assets/images/quest_maze_bg");
    const logoFiles = (0, getAllFiles_1.default)(logosDir, false);
    const defaultPfpFiles = (0, getAllFiles_1.default)(defaultPfpDir, false);
    const lbBgFiles = (0, getAllFiles_1.default)(lbBgDir, false);
    const qmBgFiles = (0, getAllFiles_1.default)(qmBgDir, false);
    const crowns = new Map();
    const goldCrownPath = logoFiles.find((f) => f.includes("gold_crown"));
    const silverCrownPath = logoFiles.find((f) => f.includes("silver_crown"));
    const bronzeCrownPath = logoFiles.find((f) => f.includes("bronze_crown"));
    if (goldCrownPath)
        crowns.set(1, yield (0, canvas_1.loadImage)(goldCrownPath));
    if (silverCrownPath)
        crowns.set(2, yield (0, canvas_1.loadImage)(silverCrownPath));
    if (bronzeCrownPath)
        crowns.set(3, yield (0, canvas_1.loadImage)(bronzeCrownPath));
    const medals = new Map();
    const goldMedalPath = logoFiles.find((f) => f.includes("gold_medal"));
    const silverMedalPath = logoFiles.find((f) => f.includes("silver_medal"));
    const bronzeMedalPath = logoFiles.find((f) => f.includes("bronze_medal"));
    if (goldMedalPath)
        medals.set(1, yield (0, canvas_1.loadImage)(goldMedalPath));
    if (silverMedalPath)
        medals.set(2, yield (0, canvas_1.loadImage)(silverMedalPath));
    if (bronzeMedalPath)
        medals.set(3, yield (0, canvas_1.loadImage)(bronzeMedalPath));
    const defaultPfps = [];
    for (const file of defaultPfpFiles) {
        defaultPfps.push(yield (0, canvas_1.loadImage)(file));
    }
    const leaderboardBgs = [];
    for (const file of lbBgFiles) {
        leaderboardBgs.push(yield (0, canvas_1.loadImage)(file));
    }
    const questMazeBgs = [];
    for (const file of qmBgFiles) {
        questMazeBgs.push(yield (0, canvas_1.loadImage)(file));
    }
    cachedAssets = {
        crowns,
        medals,
        defaultPfps,
        leaderboardBgs,
        questMazeBgs,
    };
    return cachedAssets;
});
exports.getStaticCanvasAssets = getStaticCanvasAssets;
