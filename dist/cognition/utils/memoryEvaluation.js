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
exports.evaluateMemory = void 0;
const zod_mjs_1 = require("openai/helpers/zod.mjs");
const inferMemoryEvaluation_1 = require("../zodValidation/inferMemoryEvaluation");
const seraphinaCognitionPrompts_1 = require("./seraphinaCognitionPrompts");
const openai_1 = require("./openai");
const evaluateMemory = (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield openai_1.openai.responses.parse({
            model: openai_1.openaiModel,
            instructions: seraphinaCognitionPrompts_1.memoryEvaluationPrompt,
            input: interaction,
            text: {
                format: (0, zod_mjs_1.zodTextFormat)(inferMemoryEvaluation_1.memoryEvaluationSchema, "memory_evaluation"),
            },
        });
        return response.output_parsed || undefined;
    }
    catch (err) {
        console.error("Error while evaluating memory:", err);
        return undefined;
    }
});
exports.evaluateMemory = evaluateMemory;
