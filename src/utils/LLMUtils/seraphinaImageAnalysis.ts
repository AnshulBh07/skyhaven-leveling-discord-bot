import { Attachment } from "discord.js";
import { moodType } from "../interfaces";
import axios from "axios";
import { HarmBlockThreshold, HarmCategory } from "@google/genai";
import { aiModel, genAI, imageAnalysisPrompt } from "./seraphinaPrompt";
import ChatMemory from "../../models/chatMemorySchema";

// we need to convert the image to bytes
const convertToBytes = async (url: string) => {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data as ArrayBuffer).toString("base64");

    return buffer;
  } catch (err) {
    console.error("Error converting image to base64 : ", err);
  }
};

const MAX_HISTORY = 20;

export const seraphinaAnalyzeImage = async (
  userId: string,
  attachment: Attachment,
  msg: string,
  mood: moodType
) => {
  try {
    const memory =
      (await ChatMemory.findOne({ userID: userId })) ||
      new ChatMemory({ userID: userId, messages: [] });

    // Add user input to memory *before* sending to Gemini
    memory.messages.push({ role: "user", content: msg });

    if (memory.messages.length > MAX_HISTORY) {
      memory.messages.splice(0, memory.messages.length - MAX_HISTORY);
    }

    const base64EncodedImage = await convertToBytes(attachment.url);

    if (!base64EncodedImage) {
      return "Hmm... I couldn't retrieve that image. Perhaps it vanished into the void before I could glimpse it. Try uploading it again, mortal.";
    }

    const reply = await genAI.models.generateContent({
      model: aiModel,
      contents: [
        {
          inlineData: {
            mimeType: attachment.contentType ?? "image/png",
            data: base64EncodedImage,
          },
        },
        {
          text: imageAnalysisPrompt
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
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
        ],
      },
    });

    if (!reply.text)
      return "Hmm... I couldn't analyze that image, Is everything good with your image??";

    // Add model's reply to memory
    memory.messages.push({ role: "model", content: reply.text as string });

    // Re-check history length after adding model's response
    if (memory.messages.length > MAX_HISTORY) {
      memory.messages.splice(0, memory.messages.length - MAX_HISTORY);
    }

    await memory.save();

    return reply.text;
  } catch (err) {
    console.error("Error analysing image : ", err);
    return "...";
  }
};
