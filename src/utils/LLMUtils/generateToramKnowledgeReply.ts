import { HarmBlockThreshold, HarmCategory } from "@google/genai";
import ChatMemory from "../../models/chatMemorySchema";
import fs from "fs";
import { moodType, ToramKnowledgeEntry } from "../interfaces";
import path from "path";
import { aiModel, genAI, toramQueryPrompt } from "./seraphinaPrompt";

const MAX_HISTORY = 20;

export const generateToramReply = async (
  userID: string,
  mood: moodType,
  msg: string,
  document: ToramKnowledgeEntry | null
): Promise<string> => {
  try {
    const memory =
      (await ChatMemory.findOne({ userID: userID })) ||
      new ChatMemory({ userID: userID, messages: [] });

    if (memory.messages.length > MAX_HISTORY) {
      memory.messages.splice(0, memory.messages.length - MAX_HISTORY);
    }

    // get document from pdf files folder
    const pdfFile = fs.readFileSync(
      path.join(
        __dirname,
        "../..",
        `data/guides/${document ? document.name : `complete_guide`}.pdf`
      )
    );

    const reply = await genAI.models.generateContent({
      model: aiModel,
      contents: [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: Buffer.from(pdfFile).toString("base64"),
          },
        },
        {
          text: toramQueryPrompt
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
      return "Hmm... I couldn't analyze that inquiry, Is everything good with your image??";

    // Add model's reply to memory
    memory.messages.push({ role: "model", content: reply.text as string });

    // Re-check history length after adding model's response
    if (memory.messages.length > MAX_HISTORY) {
      memory.messages.splice(0, memory.messages.length - MAX_HISTORY);
    }

    await memory.save();

    return reply.text;
  } catch (err) {
    console.error("Error generating toram knowledge based reply : ", err);
    return "...";
  }
};
