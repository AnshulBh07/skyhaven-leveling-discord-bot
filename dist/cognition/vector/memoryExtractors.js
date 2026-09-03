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
exports.extractReflectionMemory = exports.extractRelationshipMemory = exports.extractSemanticMemory = exports.extractEpisodicMemory = void 0;
// Seraphina’s autobiographical memory processor.
const zod_mjs_1 = require("openai/helpers/zod.mjs");
const openai_1 = require("../utils/openai");
const seraphinaCognitionPrompts_1 = require("../utils/seraphinaCognitionPrompts");
const inferEpisodicMemory_1 = require("../zodValidation/inferEpisodicMemory");
const inferSemanticMemory_1 = require("../zodValidation/inferSemanticMemory");
const inferRelationshipState_1 = require("../zodValidation/inferRelationshipState");
const inferReflectionMemory_1 = require("../zodValidation/inferReflectionMemory");
const extractEpisodicMemory = (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield openai_1.openai.responses.parse({
            model: openai_1.openaiModel,
            instructions: seraphinaCognitionPrompts_1.episodicMemoryExtractorPrompt,
            input: interaction,
            text: { format: (0, zod_mjs_1.zodTextFormat)(inferEpisodicMemory_1.episodicMemorySchema, "episodic_memory") },
        });
        // You pass the user's *latest* message to sendMessage
        const parsed = response.output_parsed;
        if (!parsed) {
            console.log("⚠️ Seraphina fell out of sync with the divine stream. Try again shortly.");
            return undefined;
        }
        return parsed;
    }
    catch (err) {
        console.error("Error while executing memory evaluation : ", err);
        return undefined;
    }
});
exports.extractEpisodicMemory = extractEpisodicMemory;
const extractSemanticMemory = (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield openai_1.openai.responses.parse({
            model: openai_1.openaiModel,
            instructions: seraphinaCognitionPrompts_1.semanticMemoryExtractorPrompt,
            input: interaction,
            text: { format: (0, zod_mjs_1.zodTextFormat)(inferSemanticMemory_1.semanticMemorySchema, "semantic_memory") },
        });
        // You pass the user's *latest* message to sendMessage
        const reply = result.output_parsed;
        if (!reply) {
            console.log("⚠️ Seraphina fell out of sync with the divine stream. Try again shortly.");
            return undefined;
        }
        return Object.assign(Object.assign({}, reply), { memoryVersion: 1 });
    }
    catch (err) {
        console.error("Error while executing memory evaluation : ", err);
        return undefined;
    }
});
exports.extractSemanticMemory = extractSemanticMemory;
const extractRelationshipMemory = (interaction, oldState) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield openai_1.openai.responses.parse({
            model: openai_1.openaiModel,
            instructions: seraphinaCognitionPrompts_1.relationshipMemoryExtractorPrompt,
            input: oldState + "\n" + interaction,
            text: {
                format: (0, zod_mjs_1.zodTextFormat)(inferRelationshipState_1.relationshipMemorySchema, "relationship_memory"),
            },
        });
        // You pass the user's *latest* message to sendMessage
        const reply = result.output_parsed;
        if (!reply) {
            console.log("⚠️ Seraphina fell out of sync with the divine stream. Try again shortly.");
            return undefined;
        }
        return reply;
    }
    catch (err) {
        console.error("Error while executing memory evaluation : ", err);
        return undefined;
    }
});
exports.extractRelationshipMemory = extractRelationshipMemory;
const extractReflectionMemory = (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield openai_1.openai.responses.parse({
            model: openai_1.openaiModel,
            instructions: seraphinaCognitionPrompts_1.reflectionMemoryExtractorPrompt,
            input: interaction,
            text: {
                format: (0, zod_mjs_1.zodTextFormat)(inferReflectionMemory_1.reflectiveMemorySchema, "reflection_memory"),
            },
        });
        // You pass the user's *latest* message to sendMessage
        const reply = result.output_parsed;
        if (!reply) {
            console.log("⚠️ Seraphina fell out of sync with the divine stream. Try again shortly.");
            return undefined;
        }
        return reply;
    }
    catch (err) {
        console.error("Error while executing memory evaluation : ", err);
        return undefined;
    }
});
exports.extractReflectionMemory = extractReflectionMemory;
