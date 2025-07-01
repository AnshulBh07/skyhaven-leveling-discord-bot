import axios from "axios";
import { moodType } from "../interfaces";
import { yappingRolePrompt } from "./seraphinaPrompt";
import { rolePromotionMessages } from "../../data/helperArrays";

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

export const generateSeraphinaRankUpMessage = async (
  mood: moodType,
  role_name: string,
  userID: string
) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = "gemini-2.5-flash-lite-preview-06-17";

    const response = await axios.post<GeminiResponse>(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: yappingRolePrompt
                  .replace("${mood}", mood)
                  .replace("{yap_role}", role_name),
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const reply =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "⚠️ Seraphina stares blankly — the stars offered no wisdom.";

    return reply;
  } catch (err) {
    const error = err as any;
    console.error(
      "Error generating Seraphina role up reply with Gemini:",
      error.response?.data || error
    );
    return rolePromotionMessages[
      Math.floor(Math.random() * rolePromotionMessages.length)
    ]
      .replace("{user}", `<@${userID}>`)
      .replace("{role}", role_name);
  }
};
