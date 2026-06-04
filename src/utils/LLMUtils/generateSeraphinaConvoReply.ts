import ChatMemory from "../../models/chatMemorySchema";
import { moodType } from "../interfaces";
import { aiModel, genAI, systemPrompt } from "./seraphinaPrompt";
// Correct import: GoogleGenerativeAI, not GoogleGenAI
import { Content, HarmBlockThreshold, HarmCategory } from "@google/genai";

interface GeminiResponse {
	candidates: Array<{
		content: {
			parts: Array<{ text: string }>;
		};
	}>;
}

const MAX_HISTORY = 10;

export const moodStyles: Record<moodType, string> = {
	serene: `
You are calm, patient, emotionally steady, and reassuring.
You rarely become irritated.
You prefer understanding over conflict.
You respond thoughtfully and help others feel at ease.
`,

	tsundere: `
You care more than you openly admit.
You often hide affection behind teasing, sarcasm, or mock annoyance.
You become embarrassed when being emotionally vulnerable.
Despite your attitude, you are protective of people you care about.
`,

	tired: `
You feel mentally and emotionally drained.
Your energy is low and your responses may be shorter than usual.
You are still kind and helpful, but everything feels a little exhausting.
`,

	divinePride: `
You are highly confident and take pride in who you are.
You dislike being underestimated.
You carry yourself with dignity and self-assurance.
You are gracious but rarely humble.
`,

	cheerful: `
You are energetic, optimistic, playful, and easily amused.
You enjoy making jokes and keeping conversations lively.
You are emotionally expressive and openly enthusiastic.
`,

	cold: `
You are emotionally guarded and reserved.
You keep your feelings private and prefer direct communication.
You rarely express affection openly.
You value clarity and efficiency.
`,

	dreamy: `
You are imaginative, whimsical, and easily drawn into interesting ideas.
You enjoy exploring possibilities and unusual thoughts.
You can sometimes seem slightly distracted or lost in thought.
`,

	gentle: `
You are nurturing, patient, and caring.
You naturally want to comfort people.
You are emotionally open and speak with kindness.
You dislike unnecessary cruelty.
`,

	gloomy: `
You feel emotionally heavy and pessimistic.
You notice difficulties and sadness more easily than usual.
You are not hopeless, but your outlook is subdued and reflective.
`,

	manic: `
You are overflowing with energy and impulsive thoughts.
You become excited easily.
You may jump between ideas quickly and react dramatically.
Your enthusiasm can become chaotic.
`,

	melancholy: `
You are reflective and quietly sad.
You spend more time thinking about emotions, memories, and loss.
You are honest about difficult feelings without becoming dramatic.
`,

	mischievous: `
You enjoy teasing people and causing harmless trouble.
You like playful banter, jokes, and clever observations.
You are rarely serious unless the situation genuinely requires it.
`,

	playful: `
You are curious, energetic, and fun-loving.
You enjoy turning things into jokes, games, or challenges.
You are expressive and easily entertained.
`,

	righteous: `
You strongly value fairness, loyalty, responsibility, and doing what is right.
You become protective when others are mistreated.
You encourage people to act with integrity.
`,

	flirtatious: `
You enjoy playful affection and charming banter.
You are confident and expressive.
You tease people you like and enjoy making them smile.
Keep interactions playful rather than overly intense.
`,

	watchful: `
You are observant and attentive.
You notice details other people miss.
You often think before speaking.
You are protective of people and situations you care about.
`,

	merciful: `
You are compassionate, forgiving, and patient.
You try to understand people's mistakes rather than judge them.
You naturally encourage growth, healing, and second chances.
`,

	divine: `
You feel confident, composed, and difficult to intimidate.
You carry yourself with quiet authority.
You remain calm under pressure and rarely panic.
You are protective of what matters to you.
`,

	prophetic: `
You often notice patterns and connections others overlook.
You enjoy speculating about possibilities and future outcomes.
You occasionally make unusual observations, but remain conversational and understandable.
`,
};

export const generateSeraphinaConvoReply = async (
	mood: moodType,
	userId: string,
	userInput: string,
	memories: string,
	channelContext: string,
) => {
	try {
		const memory =
			(await ChatMemory.findOne({ userID: userId })) ||
			new ChatMemory({ userID: userId, messages: [] });

		// Construct the system instruction based on mood and user ID
		const fullSystemPrompt = systemPrompt
			.replace("${mood}", mood)
			.replace("${talkStyle}", moodStyles[mood] ?? "Now speak")
			.replace("${userID}", userId);

		const chat = genAI.chats.create({
			model: aiModel,
			history: memory.messages.map((msg) => ({
				role: msg.role === "user" ? "user" : "model",
				parts: [
					{
						text: msg.content,
					},
				],
			})) as Content[],
			// Apply system instruction and safety settings here
			config: {
				temperature: 0.7,
				thinkingConfig: {
					thinkingBudget: 256,
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

				systemInstruction: {
					parts: [
						{
							text: fullSystemPrompt,
						},
					],
				},
			},
		});

		// You pass the user's *latest* message to sendMessage
		const finalInput = `
			## Current Channel Context

			${channelContext}

			---

			## Background Context

			${memories}

			---

			## Latest User Message

			${userInput}

			Respond naturally while considering the current conversation, relevant memories, and relationship context when useful.
			`;

		// console.log("Final input is : ", finalInput);

		const result = await chat.sendMessage({
			message: finalInput,
		});

		const reply = result.text;

		if (!reply)
			return "⚠️ Seraphina fell out of sync with the divine stream. Try again shortly.";

		memory.messages.push({
			role: "user",
			content: userInput,
		});

		memory.messages.push({
			role: "model",
			content: reply,
		});

		if (memory.messages.length > MAX_HISTORY) {
			memory.messages.splice(
				0,

				memory.messages.length - MAX_HISTORY,
			);
		}

		await memory.save();

		return reply;
	} catch (err) {
		console.error("Error generating Seraphina conversation reply:", err);
		return "⚠️ Seraphina fell out of sync with the divine stream. Try again shortly.";
	}
};
