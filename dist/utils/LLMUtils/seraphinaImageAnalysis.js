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
exports.seraphinaAnalyzeImage = void 0;
const axios_1 = __importDefault(require("axios"));
const genai_1 = require("@google/genai");
const seraphinaPrompt_1 = require("./seraphinaPrompt");
const chatMemorySchema_1 = __importDefault(require("../../models/chatMemorySchema"));
// we need to convert the image to bytes
const convertToBytes = (url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(url, { responseType: "arraybuffer" });
        const buffer = Buffer.from(response.data).toString("base64");
        return buffer;
    }
    catch (err) {
        console.error("Error converting image to base64 : ", err);
    }
});
const MAX_HISTORY = 20;
const seraphinaAnalyzeImage = (userId, attachment, msg, mood) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const memory = (yield chatMemorySchema_1.default.findOne({ userID: userId })) ||
            new chatMemorySchema_1.default({ userID: userId, messages: [] });
        // Add user input to memory *before* sending to Gemini
        memory.messages.push({ role: "user", content: msg });
        if (memory.messages.length > MAX_HISTORY) {
            memory.messages.splice(0, memory.messages.length - MAX_HISTORY);
        }
        const base64EncodedImage = yield convertToBytes(attachment.url);
        if (!base64EncodedImage) {
            return "Hmm... I couldn't retrieve that image. Perhaps it vanished into the void before I could glimpse it. Try uploading it again, mortal.";
        }
        const reply = yield seraphinaPrompt_1.genAI.models.generateContent({
            model: seraphinaPrompt_1.aiModel,
            contents: [
                {
                    inlineData: {
                        mimeType: (_a = attachment.contentType) !== null && _a !== void 0 ? _a : "image/png",
                        data: base64EncodedImage,
                    },
                },
                {
                    text: seraphinaPrompt_1.imageAnalysisPrompt
                        .replace("{{msg}}", msg)
                        .replace("{{mood}}", mood),
                },
            ],
            config: {
                temperature: 0.85,
                thinkingConfig: {
                    thinkingBudget: 1024,
                },
                safetySettings: [
                    {
                        category: genai_1.HarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold: genai_1.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
                    },
                    {
                        category: genai_1.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                        threshold: genai_1.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
                    },
                    {
                        category: genai_1.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                        threshold: genai_1.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
                    },
                ],
            },
        });
        if (!reply.text)
            return "Hmm... I couldn't analyze that image, Is everything good with your image??";
        // Add model's reply to memory
        memory.messages.push({ role: "model", content: reply.text });
        // Re-check history length after adding model's response
        if (memory.messages.length > MAX_HISTORY) {
            memory.messages.splice(0, memory.messages.length - MAX_HISTORY);
        }
        yield memory.save();
        return reply.text;
    }
    catch (err) {
        console.error("Error analysing image : ", err);
        return "...";
    }
});
exports.seraphinaAnalyzeImage = seraphinaAnalyzeImage;
