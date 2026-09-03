import { moodType } from "../interfaces";
import { genAI, yappingRolePrompt } from "./seraphinaPrompt";
import { rolePromotionMessages } from "../../data/helperArrays";

export const generateSeraphinaRankUpMessage = async (
  mood: moodType,
  role_name: string,
  userID: string
) => {
  try {
    const model = "gemini-2.5-flash-lite";

    const promptText = yappingRolePrompt
      .replace("${mood}", mood)
      .replace("{yap_role}", role_name);

    const response = await genAI.models.generateContent({
      model: model,
      contents: [
        {
          role: "user",
          parts: [{ text: promptText }],
        },
      ],
    });

    const reply =
      response.text?.trim() ||
      "⚠️ Seraphina stares blankly — the stars offered no wisdom.";

    return reply;
  } catch (err) {
    console.error("Error generating Seraphina role up reply with Gemini:", err);
    return rolePromotionMessages[
      Math.floor(Math.random() * rolePromotionMessages.length)
    ]
      .replace("{user}", `<@${userID}>`)
      .replace("{role}", role_name);
  }
};
