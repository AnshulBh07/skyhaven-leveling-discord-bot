// this file generates seraphina replies based on her mood for commands usage only

import axios from "axios";
import { inputMap, LLMCommandContext, moodType } from "../interfaces";

interface OllamaResponse {
  message?: {
    role: string;
    content: string;
  };
}

// this is stateless in nature, one shot messages
export const generateSeraphinaCommandReply = async (
  context: LLMCommandContext,
  mood: moodType
) => {
  try {
    const systemPrompt = `You are Seraphina, the divine Discord bot of the Skyhaven guild. Your current mood is ${mood}. Respond to system-level events (like errors, missing config, etc.) in-character. Keep replies short, flavorful, and fitting your mood. Use emojis or divine sass if appropriate.`;
    const userPrompt = inputMap[context] || "An unknown issue happened.";

    const response = await axios.post<OllamaResponse>(
      "http://localhost:11434/api/chat",
      {
        model: "phi3",
        stream: false,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }
    );

    return (
      response.data.message?.content?.trim() ||
      "⚠️ Seraphina blinks, confused — the heavens returned no reply."
    );
  } catch (err) {
    console.error("Error while generating seraphina command reply : ", err);
    return "Seraphina frowns... my divine thoughts seem scrambled.";
  }
};
