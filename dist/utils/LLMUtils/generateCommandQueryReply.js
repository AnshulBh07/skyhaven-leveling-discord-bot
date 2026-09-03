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
exports.generateCommandQueryReply = void 0;
const genai_1 = require("@google/genai");
const chatMemorySchema_1 = __importDefault(require("../../models/chatMemorySchema"));
const seraphinaPrompt_1 = require("./seraphinaPrompt");
const getFinalPrompt = (input, prompt) => {
    const entries = Object.entries(input);
    let newPrompt = prompt;
    for (const [key, value] of entries) {
        newPrompt = newPrompt.replace(new RegExp(`{{${key}}}`, "g"), value);
    }
    return newPrompt;
};
const MAX_HISTORY = 20;
const generateCommandQueryReply = (msg, command, mood, userID) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const inputInfo = {
            name: command.name,
            description: command.description,
            category: command.category,
            usage: command.usage,
            aliases: command.aliases,
            examples: command.examples,
            notes: command.notes,
            userQuery: msg,
            mood: mood,
        };
        const finalPrompt = getFinalPrompt(inputInfo, seraphinaPrompt_1.commandQueryPrompt);
        // console.log("final prompt is : ", finalPrompt);
        const memory = (yield chatMemorySchema_1.default.findOne({ userID: userID })) ||
            new chatMemorySchema_1.default({ userID: userID, messages: [] });
        // Add user input to memory *before* sending to Gemini
        memory.messages.push({ role: "user", content: msg });
        if (memory.messages.length > MAX_HISTORY) {
            memory.messages.splice(0, memory.messages.length - MAX_HISTORY);
        }
        const chat = seraphinaPrompt_1.genAI.chats.create({
            model: seraphinaPrompt_1.aiModel,
            history: [
                ...memory.messages.map((msg) => {
                    var _a;
                    return ({
                        role: msg.role === "user" ? "user" : "model",
                        parts: [{ text: (_a = msg.content) !== null && _a !== void 0 ? _a : "" }],
                    });
                }),
            ],
            // Apply system instruction and safety settings here
            config: {
                temperature: 0.85,
                thinkingConfig: {
                    thinkingBudget: 0,
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
                systemInstruction: {
                    parts: [
                        {
                            text: finalPrompt,
                        },
                    ],
                },
            },
        });
        // You pass the user's *latest* message to sendMessage
        const result = yield chat.sendMessage({ message: msg });
        const reply = result.text;
        if (!reply)
            return "⚠️ Seraphina fell out of sync with the divine stream. Try again shortly.";
        // Add model's reply to memory
        memory.messages.push({ role: "model", content: reply });
        // Re-check history length after adding model's response
        if (memory.messages.length > MAX_HISTORY) {
            memory.messages.splice(0, memory.messages.length - MAX_HISTORY);
        }
        yield memory.save();
        return reply;
    }
    catch (err) {
        console.error("Error generating command query reply : ", err);
        return "⚠️ Seraphina fell out of sync with the divine stream. Try again shortly.";
    }
});
exports.generateCommandQueryReply = generateCommandQueryReply;
