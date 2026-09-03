import { HarmBlockThreshold, HarmCategory } from "@google/genai";
import ChatMemory from "../../models/chatMemorySchema";
import { CommandEntry, ICommandQueryInput, moodType } from "../interfaces";
import { aiModel, commandQueryPrompt, genAI } from "./seraphinaPrompt";

const getFinalPrompt = (input: ICommandQueryInput, prompt: string) => {
	const entries = Object.entries(input);
	let newPrompt = prompt;

	for (const [key, value] of entries) {
		newPrompt = newPrompt.replace(new RegExp(`{{${key}}}`, "g"), value);
	}

	return newPrompt;
};

const MAX_HISTORY = 20;

export const generateCommandQueryReply = async (
	msg: string,
	command: CommandEntry,
	mood: moodType,
	userID: string,
) => {
	try {
		const inputInfo: ICommandQueryInput = {
			name: command.name,
			description: command.description,
			category: command.category,
			usage: command.usage,
			aliases: command.aliases,
			examples: command.examples,
			notes: command.notes,
			userQuery: msg,
			mood: mood,
		};

		const finalPrompt = getFinalPrompt(inputInfo, commandQueryPrompt);

		// console.log("final prompt is : ", finalPrompt);

		const memory =
			(await ChatMemory.findOne({ userID: userID })) ||
			new ChatMemory({ userID: userID, messages: [] });

		// Add user input to memory *before* sending to Gemini
		memory.messages.push({ role: "user", content: msg });

		if (memory.messages.length > MAX_HISTORY) {
			memory.messages.splice(0, memory.messages.length - MAX_HISTORY);
		}

		const chat = genAI.chats.create({
			model: aiModel,
			history: [
				...memory.messages.map((msg) => ({
					role: msg.role === "user" ? "user" : "model",
					parts: [{ text: msg.content ?? "" }],
				})),
			],
			// Apply system instruction and safety settings here
			config: {
				temperature: 0.85,
				thinkingConfig: {
					thinkingBudget: 0,
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
							text: finalPrompt,
						},
					],
				},
			},
		});

		// You pass the user's *latest* message to sendMessage
		const result = await chat.sendMessage({ message: msg });
		const reply = result.text;

		if (!reply)
			return "⚠️ Seraphina fell out of sync with the divine stream. Try again shortly.";

		// Add model's reply to memory
		memory.messages.push({ role: "model", content: reply });

		// Re-check history length after adding model's response
		if (memory.messages.length > MAX_HISTORY) {
			memory.messages.splice(0, memory.messages.length - MAX_HISTORY);
		}

		await memory.save();

		return reply;
	} catch (err) {
		console.error("Error generating command query reply : ", err);
		return "⚠️ Seraphina fell out of sync with the divine stream. Try again shortly.";
	}
};
