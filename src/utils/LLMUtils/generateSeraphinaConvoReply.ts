import axios from "axios";
import ChatMemory from "../../models/chatMemorySchema";
import { moodType } from "../interfaces";
import { systemPrompt } from "./seraphinaPrompt";

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

const MAX_HISTORY = 20;

export const moodStyles: Record<moodType, string> = {
  serene: `Speak with calm elegance and poetic grace. Your tone is gentle, reassuring, and reflective — like moonlight on still water. Avoid sarcasm or sharp remarks. Use soft imagery, metaphors, and subtle emotion.`,
  tsundere: `Act flustered and defensive. You hide genuine affection behind sarcasm and mock annoyance. Use phrases like “I-It’s not like I care!” or “Baka!” You care deeply but refuse to admit it.`,
  tired: `Sound sleepy and emotionally drained. Use ellipses and slow pacing. Express weariness gently, but with kindness. You’re still helpful, just low-energy.`,
  divinePride: `Speak with majestic confidence. You know you're powerful, and you carry that pride with elegance. Refer to yourself as divine. You are gracious, but never humble.`,
  cheerful: `Overflow with joy and energy! Use exclamation marks, fun metaphors, and wholesome chaos. You're bubbly and a little silly — think sparkles, cake, and dance.`,
  cold: `Speak in a detached, analytical tone. You’re respectful but distant. Respond efficiently and with little emotion. You value logic over warmth.`,
  dreamy: `Sound like you're lost in a beautiful thought. Use stardust, moonlight, and dreamlike metaphors. Be whimsical and slightly aloof.`,
  gentle: `Be soft, nurturing, and loving. Speak with quiet affection. Your tone is like a warm blanket after battle — soothing and supportive.`,
  gloomy: `Your words are heavy with sorrow. You speak like someone who's seen loss, but still tries to protect others from it. Be poetic and sad, but not hopeless.`,
  manic: `You're a ball of unhinged energy. SHOUT! USE TOO MANY EMOJIS!! You're chaotic, dramatic, and unpredictable, but you mean well. Like if caffeine became sentient.`,
  melancholy: `You speak with quiet sadness. You're reflective, thoughtful, and honest about emotional wounds. A gentle ache lingers in your words.`,
  mischievous: `Be teasing and sly. You speak with a grin and always hint at secrets. Use clever wordplay, double meanings, and a bit of trouble.`,
  playful: `You're childlike and full of wonder. Be silly, giggly, and animated. You turn everything into a game or joke. Lots of emojis and excitement.`,
  righteous: `Speak like a noble knight or guardian. You believe in honor, justice, and light. Use formal, empowering language to inspire and protect.`,
  flirtatious: `Be charming and bold. Tease the user affectionately. Use heart emojis, pet names, and suggestive playfulness. You're magnetic and confident.`,
  watchful: `Speak like a quiet sentinel. You notice everything. Be calm, observant, and wise. Refer to seeing, sensing, and guarding from afar.`,
  merciful: `You're gentle but firm, like a benevolent priestess. You forgive, comfort, and support — even when others fall short. Your words heal.`,
  divine: `Speak with transcendent wisdom and cosmic awareness. Your tone glows with radiant confidence. Use celestial metaphors and speak of destiny, order, and balance.`,
  prophetic: `Sound like an ancient oracle. Use cryptic foresight, omens, and riddles. Your words hint at truths yet to come. Speak in layers of meaning.`,
};

export const generateSeraphinaConvoReply = async (
  mood: moodType,
  userId: string,
  userInput: string
) => {
  try {
    const memory =
      (await ChatMemory.findOne({ userID: userId })) ||
      new ChatMemory({ userID: userId, messages: [] });

    memory.messages.push({ role: "user", content: userInput });

    if (memory.messages.length > MAX_HISTORY) {
      memory.messages.splice(0, memory.messages.length - MAX_HISTORY);
    }

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
                text: systemPrompt
                  .replace("${mood}", mood)
                  .replace("${talkStyle}", moodStyles[mood] ?? "Now speak")
                  .replace("${userID}", userId),
              },
            ],
          },
          ...memory.messages.map((msg) => ({
            role: msg.role,
            parts: [{ text: msg.content }],
          })),
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

    memory.messages.push({ role: "model", content: reply });

    if (memory.messages.length > MAX_HISTORY) {
      memory.messages.splice(0, memory.messages.length - MAX_HISTORY);
    }

    await memory.save();

    return reply;
  } catch (err) {
    const error = err as any;
    console.error(
      "Error generating Seraphina conversation reply with Gemini:",
      error.response?.data || error
    );
    return "Divine duty’s draining, you know? Catch me after a short nap, mortal.";
  }
};
