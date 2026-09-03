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
exports.generateLeaderboardCanvas = void 0;
const discord_js_1 = require("discord.js");
const generateLeaderboardUserTile_1 = require("./utils/generateLeaderboardUserTile");
const generateLeaderboardCanvas = (client, leaderboardList, type, bgImage, roles) => __awaiter(void 0, void 0, void 0, function* () {
    const { createCanvas, loadImage } = yield Promise.resolve().then(() => __importStar(require("canvas")));
    const width = 2600;
    const height = 1600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    try {
        const loadedBg = typeof bgImage === "string" ? yield loadImage(bgImage) : bgImage;
        ctx.drawImage(loadedBg, 0, 0, width, height);
        // Parallelize user info + avatar network downloads across all tiles
        const preloadedTilesData = yield Promise.all(leaderboardList.map((userInfo) => (0, generateLeaderboardUserTile_1.fetchLeaderboardTileData)(client, userInfo)));
        const columns = 2;
        const rows = 5;
        const padding = 50;
        const tileWidth = (width - padding * (columns + 1)) / columns;
        const tileHeight = (height - padding * (rows + 1)) / rows;
        for (let i = 0; i < leaderboardList.length; i++) {
            const col = Math.floor(i / rows);
            const row = i % rows;
            const x = padding + col * (tileWidth + padding);
            const y = padding + row * (tileHeight + padding);
            const role = roles.find((role) => role.id === leaderboardList[i].currentRole);
            const tileCanvas = yield (0, generateLeaderboardUserTile_1.generateLeaderboardUserTile)(client, leaderboardList[i], tileWidth, tileHeight, type, role, preloadedTilesData[i]);
            ctx.drawImage(tileCanvas, x, y, tileWidth, tileHeight);
        }
        const buffer = canvas.toBuffer("image/png");
        return new discord_js_1.AttachmentBuilder(buffer, {
            name: "bg.png",
        });
    }
    catch (err) {
        console.error("❌ Error generating leaderboard canvas:", err);
        return undefined;
    }
});
exports.generateLeaderboardCanvas = generateLeaderboardCanvas;
