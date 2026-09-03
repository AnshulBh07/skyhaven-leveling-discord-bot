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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLeaderboardUserTile = exports.fetchLeaderboardTileData = exports.getCrownImage = void 0;
const canvas_1 = require("canvas");
const getNextLevelXP_1 = require("../../utils/getNextLevelXP");
const staticAssetCache_1 = require("./staticAssetCache");
const getCrownImage = (rank) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const assets = yield (0, staticAssetCache_1.getStaticCanvasAssets)();
        return assets.crowns.get(rank);
    }
    catch (err) {
        console.error("Error loading crown image.", err);
        return undefined;
    }
});
exports.getCrownImage = getCrownImage;
const formatXpToK = (xp) => {
    if (xp < 1000)
        return xp.toString();
    const formatted = (xp / 1000).toFixed(xp % 1000 === 0 ? 0 : 1);
    return `${formatted}k`;
};
const fetchLeaderboardTileData = (client, userInfo) => __awaiter(void 0, void 0, void 0, function* () {
    const assets = yield (0, staticAssetCache_1.getStaticCanvasAssets)();
    const defaultPfps = assets.defaultPfps;
    const fallbackAvatar = defaultPfps[Math.floor(Math.random() * defaultPfps.length)];
    try {
        const user = yield client.users.fetch(userInfo.userID);
        const avatarUrl = user.displayAvatarURL({
            extension: "png",
            size: 256,
        });
        const res = yield fetch(avatarUrl);
        if (!res.ok) {
            return { user, avatar: fallbackAvatar };
        }
        const arrayBuffer = yield res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const avatar = yield (0, canvas_1.loadImage)(buffer);
        return { user, avatar };
    }
    catch (err) {
        try {
            const user = yield client.users.fetch(userInfo.userID);
            return { user, avatar: fallbackAvatar };
        }
        catch (_a) {
            // create fallback dummy user object if user fetch fails
            const dummyUser = {
                displayName: "Unknown",
                username: "Unknown",
            };
            return { user: dummyUser, avatar: fallbackAvatar };
        }
    }
});
exports.fetchLeaderboardTileData = fetchLeaderboardTileData;
const generateLeaderboardUserTile = (client, userInfo, width, height, type, role, preloadedData) => __awaiter(void 0, void 0, void 0, function* () {
    const { createCanvas } = yield Promise.resolve().then(() => __importStar(require("canvas")));
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    try {
        const { user, avatar } = preloadedData || (yield (0, exports.fetchLeaderboardTileData)(client, userInfo));
        // background
        const padding = 10;
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = "#0c0d0c";
        ctx.beginPath();
        ctx.roundRect(padding, padding, width - padding * 2, height - padding * 2, 20);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.lineWidth = 7;
        ctx.strokeStyle = "#434445";
        ctx.beginPath();
        ctx.roundRect(padding, padding, width - padding * 2, height - padding * 2, 20);
        ctx.closePath();
        ctx.stroke();
        // save current settings to prevent clipping
        const avatarSize = height * 0.6;
        const avatarX = padding * 6;
        const avatarY = height / 2 - avatarSize / 2 - 5;
        // Draw avatar as circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();
        // load crowns if the rank is less than 3
        if (userInfo.rank < 4) {
            const crownImage = yield (0, exports.getCrownImage)(userInfo.rank);
            if (crownImage) {
                const crownWidth = avatarSize * 1;
                const crownHeight = crownWidth * (crownImage.height / crownImage.width);
                const crownX = avatarX + avatarSize / 2 - crownWidth / 2 - 60;
                const crownY = avatarY - crownHeight / 2 - 5;
                ctx.save();
                // Translate to center of crown
                ctx.translate(crownX + crownWidth / 2, crownY + crownHeight / 2);
                ctx.rotate((-30 * Math.PI) / 180); // convert degrees to radians
                // Draw crown centered at origin
                ctx.drawImage(crownImage, -crownWidth / 2, -crownHeight / 2, crownWidth, crownHeight);
                ctx.restore();
            }
        }
        // if ranking >=4 display the rank nummber
        if (userInfo.rank >= 4) {
            ctx.save();
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 50px 'Segoe UI', sans-serif";
            ctx.fillText(userInfo.rank.toString() + ".", 25, 70);
            ctx.restore();
        }
        const baseY = 120;
        // Username
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 60px 'Segoe UI', sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillText(user.displayName.split(" ")[0], 240, 160);
        // Level Label
        ctx.font = "40px 'Segoe UI', sans-serif";
        ctx.textBaseline = "bottom";
        ctx.fillText("Lvl:", 725, baseY - 10);
        // Level Value
        ctx.font = "bold 60px 'Segoe UI', sans-serif";
        ctx.fillText(userInfo.level.toString(), 795, baseY);
        // XP Label
        ctx.font = "40px 'Segoe UI', sans-serif";
        ctx.fillText("XP:", 910, baseY - 10);
        // XP Value
        ctx.font = "bold 60px 'Segoe UI', sans-serif";
        ctx.fillText(formatXpToK(userInfo.xp), 980, baseY);
        // if role exists make the role tag
        if (role) {
            const rectX = 700;
            const rectY = 150;
            const rectWidth = 500;
            const rectHeight = 85;
            // Draw the rectangle
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = role.hexColor;
            ctx.beginPath();
            ctx.roundRect(rectX, rectY, rectWidth, rectHeight, 20);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.lineWidth = 4;
            ctx.strokeStyle = role.hexColor;
            ctx.beginPath();
            ctx.roundRect(rectX, rectY, rectWidth, rectHeight, 20);
            ctx.closePath();
            ctx.stroke();
            // Centered text inside
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "bold 40px 'Segoe UI', sans-serif";
            ctx.fillText(role.name, rectX + rectWidth / 2, rectY + rectHeight / 2);
            // now we make a progress bar
            const progress_width = 650;
            const progress_height = 15;
            if (type === "none") {
                ctx.save();
                // progress base
                ctx.fillStyle = "#ffffff";
                ctx.globalAlpha = 0.4;
                ctx.beginPath();
                ctx.roundRect(30, 220, progress_width, progress_height, 12);
                ctx.closePath();
                ctx.fill();
                // progress
                const totalXp = (0, getNextLevelXP_1.getNextLvlXP)(userInfo.level);
                const progress = (userInfo.xp / totalXp) * progress_width;
                ctx.globalAlpha = 1;
                ctx.fillStyle = role.hexColor;
                ctx.beginPath();
                ctx.roundRect(30, 220, progress, progress_height, 12);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        }
    }
    catch (err) {
        console.error("Error in generating leaderboard user tile : ", err);
    }
    return canvas;
});
exports.generateLeaderboardUserTile = generateLeaderboardUserTile;
