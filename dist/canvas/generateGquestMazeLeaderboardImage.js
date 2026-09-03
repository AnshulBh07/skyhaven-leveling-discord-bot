"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.generateGquestMazeLeaderboardImage = void 0;
const discord_js_1 = require("discord.js");
const axios_1 = __importDefault(require("axios"));
const canvas_1 = require("canvas");
const staticAssetCache_1 = require("./utils/staticAssetCache");
const getMedal = (rank) => __awaiter(void 0, void 0, void 0, function* () {
    const assets = yield (0, staticAssetCache_1.getStaticCanvasAssets)();
    const medalImage = assets.medals.get(rank);
    switch (rank) {
        case 1:
            return { color: "#FFD700", medalImage };
        case 2:
            return { color: "#C0C0C0", medalImage };
        case 3:
            return { color: "#CD7F32", medalImage };
        default:
            return { color: "", medalImage: undefined };
    }
});
const fetchUserTileData = (client, dummyUser) => __awaiter(void 0, void 0, void 0, function* () {
    const assets = yield (0, staticAssetCache_1.getStaticCanvasAssets)();
    const defaultPfps = assets.defaultPfps;
    const fallbackAvatar = defaultPfps[Math.floor(Math.random() * defaultPfps.length)];
    try {
        const user = yield client.users.fetch(dummyUser.userID);
        const avatarUrl = user.displayAvatarURL({ extension: "png", size: 256 });
        try {
            const response = yield axios_1.default.get(avatarUrl, {
                responseType: "arraybuffer",
            });
            const buffer = Buffer.from(response.data);
            const avatar = yield (0, canvas_1.loadImage)(buffer);
            return { user, avatar };
        }
        catch (_a) {
            return { user, avatar: fallbackAvatar };
        }
    }
    catch (_b) {
        const dummy = {
            username: "Unknown",
        };
        return { user: dummy, avatar: fallbackAvatar };
    }
});
const generateGquestMazeLeaderboardImage = (client, users) => __awaiter(void 0, void 0, void 0, function* () {
    const { createCanvas } = yield Promise.resolve().then(() => __importStar(require("canvas")));
    const width = 900, height = 1280;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    try {
        const assets = yield (0, staticAssetCache_1.getStaticCanvasAssets)();
        const bg = assets.questMazeBgs[Math.floor(Math.random() * assets.questMazeBgs.length)];
        ctx.drawImage(bg, 0, 0, width, height);
        // Parallelize all 10 user info + avatar network downloads
        const preloadedData = yield Promise.all(users.map((u) => fetchUserTileData(client, u)));
        const outerPadding = 15;
        const cardWidth = width - 2 * outerPadding;
        const cardHeight = (height - outerPadding * 2 - 9 * outerPadding) / 10;
        for (let i = 0; i < users.length; i++) {
            const dummyUser = users[i];
            const medalInfo = yield getMedal(dummyUser.rank);
            const color = "#ffffff";
            const x = outerPadding;
            const y = outerPadding + i * (cardHeight + outerPadding);
            ctx.globalAlpha = 0.9;
            ctx.fillStyle = "#0c0d0c";
            ctx.beginPath();
            ctx.roundRect(x, y, cardWidth, cardHeight, 12);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1.0;
            ctx.strokeStyle = "#3b3b3b";
            ctx.beginPath();
            ctx.roundRect(x, y, cardWidth, cardHeight, 12);
            ctx.closePath();
            ctx.stroke();
            const textPlacementY = y + cardHeight / 2;
            const textPlacementX = x;
            ctx.fillStyle = medalInfo.color || color;
            ctx.font = "bold 40px 'Segoe UI', sans-serif";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(`${dummyUser.rank}.`, textPlacementX + 30, textPlacementY);
            ctx.save();
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.roundRect(textPlacementX + 90, textPlacementY - 45, 90, 90, 20);
            ctx.closePath();
            ctx.fill();
            ctx.clip();
            const { user, avatar } = preloadedData[i];
            ctx.drawImage(avatar, textPlacementX + 90, textPlacementY - 45, 90, 90);
            ctx.restore();
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 35px 'Segoe UI', sans-serif";
            ctx.fillText(user.username, textPlacementX + 200, textPlacementY);
            ctx.font = "25px 'Segoe UI', sans-serif";
            ctx.fillText("Completed : ", textPlacementX + 460, textPlacementY);
            ctx.font = "bold 35px 'Segoe UI', sans-serif";
            ctx.fillText(dummyUser.completed.toString(), textPlacementX + 600, textPlacementY);
            ctx.font = "25px 'Segoe UI', sans-serif";
            ctx.fillText("Score : ", textPlacementX + 678, textPlacementY);
            ctx.font = "bold 35px 'Segoe UI', sans-serif";
            ctx.fillText(dummyUser.contribution_score.toString(), textPlacementX + 760, textPlacementY);
            if (medalInfo.medalImage) {
                ctx.drawImage(medalInfo.medalImage, x + 55, y, 60, 60);
            }
        }
    }
    catch (err) {
        console.error("Error generating guild quest or maze leaderboard canvas:", err);
    }
    const buffer = canvas.toBuffer("image/png");
    return new discord_js_1.AttachmentBuilder(buffer, { name: "leaderboard.png" });
});
exports.generateGquestMazeLeaderboardImage = generateGquestMazeLeaderboardImage;
