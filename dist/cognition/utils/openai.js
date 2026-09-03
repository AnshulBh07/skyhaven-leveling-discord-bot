"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openaiModel = exports.openai = void 0;
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
const envFile = `.env.${process.env.NODE_ENV || "development"}`;
dotenv_1.default.config({ path: envFile });
exports.openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
exports.openaiModel = "gpt-5-nano";
