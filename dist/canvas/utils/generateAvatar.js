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
exports.generateAvatar = void 0;
const path_1 = __importDefault(require("path"));
const getAllFiles_1 = __importDefault(require("../../utils/getAllFiles"));
const axios_1 = __importDefault(require("axios"));
// function generates avatar and name
const generateAvatar = (user_1, themeColor_1, baseColor_1, ...args_1) => __awaiter(void 0, [user_1, themeColor_1, baseColor_1, ...args_1], void 0, function* (user, themeColor, baseColor, size = 126) {
    const { createCanvas, Image, loadImage } = yield Promise.resolve().then(() => __importStar(require("canvas")));
    const canvas = createCanvas(800, 180);
    const ctx = canvas.getContext("2d");
    try {
        const avatarURL = user.displayAvatarURL({ extension: "png", size: 256 });
        let avatar;
        // get random default pfps
        const defaultPfp = (0, getAllFiles_1.default)(path_1.default.join(__dirname, "../..", "assets/images/default_pfp"), false);
        try {
            const response = yield axios_1.default.get(avatarURL, {
                responseType: "arraybuffer",
            });
            const buffer = Buffer.from(response.data);
            avatar = yield loadImage(buffer);
        }
        catch (_a) {
            avatar = yield loadImage(defaultPfp[Math.floor(Math.random() * defaultPfp.length)]);
        }
        const borderWidth = 5;
        // name/usertag
        ctx.fillStyle = baseColor;
        ctx.font = "bold 40px 'Segoe UI', sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(user.displayName.split(" ")[0], 170, 85);
        // image background for border
        ctx.globalAlpha = 1;
        ctx.fillStyle = themeColor;
        ctx.beginPath();
        ctx.arc(100, 180 / 2, 55 + borderWidth, 0, Math.PI * 2);
        ctx.fill();
        // avatar
        ctx.beginPath();
        ctx.arc(100, 180 / 2, 55, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 100 - 55, 90 - 55, 110, 110);
    }
    catch (err) {
        console.error(err);
    }
    return canvas;
});
exports.generateAvatar = generateAvatar;
