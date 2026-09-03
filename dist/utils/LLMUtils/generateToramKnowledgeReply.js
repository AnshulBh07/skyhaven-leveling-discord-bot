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
exports.generateToramReply = void 0;
const genai_1 = require("@google/genai");
const chatMemorySchema_1 = __importDefault(require("../../models/chatMemorySchema"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const seraphinaPrompt_1 = require("./seraphinaPrompt");
const MAX_HISTORY = 20;
const generateToramReply = (userID, mood, msg, document) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const memory = (yield chatMemorySchema_1.default.findOne({ userID: userID })) ||
            new chatMemorySchema_1.default({ userID: userID, messages: [] });
        if (memory.messages.length > MAX_HISTORY) {
            memory.messages.splice(0, memory.messages.length - MAX_HISTORY);
        }
        // get document from pdf files folder
        const pdfFile = fs_1.default.readFileSync(path_1.default.join(__dirname, "../..", `data/guides/${document ? document.name : `complete_guide`}.pdf`));
        const reply = yield seraphinaPrompt_1.genAI.models.generateContent({
            model: seraphinaPrompt_1.aiModel,
            contents: [
                {
                    inlineData: {
                        mimeType: "application/pdf",
                        data: Buffer.from(pdfFile).toString("base64"),
                    },
                },
                {
                    text: seraphinaPrompt_1.toramQueryPrompt
                        .replace(new RegExp("{query}", "g"), msg)
                        .replace("{mood}", mood),
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
            return "Hmm... I couldn't analyze that inquiry, Is everything good with your image??";
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
        console.error("Error generating toram knowledge based reply : ", err);
        return "...";
    }
});
exports.generateToramReply = generateToramReply;
