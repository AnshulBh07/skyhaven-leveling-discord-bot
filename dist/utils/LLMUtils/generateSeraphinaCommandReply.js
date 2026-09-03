"use strict";
// this file generates seraphina replies based on her mood for commands usage only
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
exports.generateSeraphinaCommandReply = void 0;
const axios_1 = __importDefault(require("axios"));
const interfaces_1 = require("../interfaces");
// this is stateless in nature, one shot messages
const generateSeraphinaCommandReply = (context, mood) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const systemPrompt = `You are Seraphina, the divine Discord bot of the Skyhaven guild. Your current mood is ${mood}. Respond to system-level events (like errors, missing config, etc.) in-character. Keep replies short, flavorful, and fitting your mood. Use emojis or divine sass if appropriate.`;
        const userPrompt = interfaces_1.inputMap[context] || "An unknown issue happened.";
        const response = yield axios_1.default.post("http://localhost:11434/api/chat", {
            model: "phi3",
            stream: false,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
        });
        return (((_b = (_a = response.data.message) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.trim()) ||
            "⚠️ Seraphina blinks, confused — the heavens returned no reply.");
    }
    catch (err) {
        console.error("Error while generating seraphina command reply : ", err);
        return "Seraphina frowns... my divine thoughts seem scrambled.";
    }
});
exports.generateSeraphinaCommandReply = generateSeraphinaCommandReply;
