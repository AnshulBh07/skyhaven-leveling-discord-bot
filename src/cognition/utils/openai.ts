import OpenAI from "openai";
import dotenv from "dotenv";

const envFile = `.env.${process.env.NODE_ENV || "development"}`;

dotenv.config({ path: envFile });

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const openaiModel = "gpt-5-nano";
