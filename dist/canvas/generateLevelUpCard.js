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
exports.generateLvlUpCard = void 0;
const discord_js_1 = require("discord.js");
const generateBackground_1 = require("./utils/generateBackground");
const generateLvlTransition_1 = require("./utils/generateLvlTransition");
const generateAvatar_1 = require("./utils/generateAvatar");
const getDominantColor_1 = require("./utils/getDominantColor");
const adjustHexShades_1 = require("./utils/adjustHexShades");
const generateLvlUpCard = (user, previous_level, current_level) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { createCanvas } = yield Promise.resolve().then(() => __importStar(require("canvas")));
        const canvas = createCanvas(800, 180);
        const ctx = canvas.getContext("2d");
        const avatarUrl = user.displayAvatarURL({ extension: "jpg", size: 256 });
        const dominantColor = yield (0, getDominantColor_1.getDominantColor)(avatarUrl);
        const baseColor = (0, adjustHexShades_1.makeColorReadableOnWhite)(dominantColor, 60);
        const bgColor = "#ffffff";
        const bgCanvas = (0, generateBackground_1.generateBackground)(dominantColor, baseColor);
        const lvlTransitionCanvas = (0, generateLvlTransition_1.generateLvlTransition)(previous_level, current_level, baseColor);
        const avatarCanvas = yield (0, generateAvatar_1.generateAvatar)(user, bgColor, baseColor);
        ctx.drawImage(bgCanvas, 0, 0);
        ctx.drawImage(lvlTransitionCanvas, 0, 0);
        ctx.drawImage(avatarCanvas, 0, 0);
        const buffer = canvas.toBuffer();
        const card = new discord_js_1.AttachmentBuilder(buffer, { name: "lvlupCard.png" });
        return card;
    }
    catch (err) {
        console.error(err);
        return undefined;
    }
});
exports.generateLvlUpCard = generateLvlUpCard;
