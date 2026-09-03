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
exports.getDominantColor = void 0;
const axios_1 = __importDefault(require("axios"));
const colorthief_1 = __importDefault(require("colorthief"));
const rgbToHex_1 = require("./rgbToHex");
const getDominantColor = (avatarUrl) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(avatarUrl, {
            responseType: "arraybuffer",
        });
        const buffer = Buffer.from(response.data);
        const dominantColor = yield colorthief_1.default.getColor(buffer);
        if (!dominantColor)
            return "#ffffff";
        const dominantColorHex = (0, rgbToHex_1.rgbToHex)(...dominantColor);
        return dominantColorHex;
    }
    catch (err) {
        console.error(err);
        return "#0051a8";
    }
});
exports.getDominantColor = getDominantColor;
