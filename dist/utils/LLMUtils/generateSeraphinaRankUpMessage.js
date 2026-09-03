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
exports.generateSeraphinaRankUpMessage = void 0;
const axios_1 = __importDefault(require("axios"));
const seraphinaPrompt_1 = require("./seraphinaPrompt");
const helperArrays_1 = require("../../data/helperArrays");
const generateSeraphinaRankUpMessage = (mood, role_name, userID) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const model = "gemini-2.5-flash-lite";
        const response = yield axios_1.default.post(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: seraphinaPrompt_1.yappingRolePrompt
                                .replace("${mood}", mood)
                                .replace("{yap_role}", role_name),
                        },
                    ],
                },
            ],
        }, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        const reply = ((_f = (_e = (_d = (_c = (_b = (_a = response.data.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text) === null || _f === void 0 ? void 0 : _f.trim()) ||
            "⚠️ Seraphina stares blankly — the stars offered no wisdom.";
        return reply;
    }
    catch (err) {
        const error = err;
        console.error("Error generating Seraphina role up reply with Gemini:", ((_g = error.response) === null || _g === void 0 ? void 0 : _g.data) || error);
        return helperArrays_1.rolePromotionMessages[Math.floor(Math.random() * helperArrays_1.rolePromotionMessages.length)]
            .replace("{user}", `<@${userID}>`)
            .replace("{role}", role_name);
    }
});
exports.generateSeraphinaRankUpMessage = generateSeraphinaRankUpMessage;
