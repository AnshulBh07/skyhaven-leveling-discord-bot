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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSeraphinaRankUpMessage = void 0;
const seraphinaPrompt_1 = require("./seraphinaPrompt");
const helperArrays_1 = require("../../data/helperArrays");
const generateSeraphinaRankUpMessage = (mood, role_name, userID) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const model = "gemini-2.5-flash-lite";
        const promptText = seraphinaPrompt_1.yappingRolePrompt
            .replace("${mood}", mood)
            .replace("{yap_role}", role_name);
        const response = yield seraphinaPrompt_1.genAI.models.generateContent({
            model: model,
            contents: [
                {
                    role: "user",
                    parts: [{ text: promptText }],
                },
            ],
        });
        const reply = ((_a = response.text) === null || _a === void 0 ? void 0 : _a.trim()) ||
            "⚠️ Seraphina stares blankly — the stars offered no wisdom.";
        return reply;
    }
    catch (err) {
        console.error("Error generating Seraphina role up reply with Gemini:", err);
        return helperArrays_1.rolePromotionMessages[Math.floor(Math.random() * helperArrays_1.rolePromotionMessages.length)]
            .replace("{user}", `<@${userID}>`)
            .replace("{role}", role_name);
    }
});
exports.generateSeraphinaRankUpMessage = generateSeraphinaRankUpMessage;
