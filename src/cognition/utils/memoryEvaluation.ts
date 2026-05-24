import { aiModel, genAI } from "../../utils/LLMUtils/seraphinaPrompt";
import { MemoryEvaluation } from "./memoryArchitectureTypes";
import { memoryEvaluationPrompt } from "./seraphinaCognitionPrompts";

export const evaluateMemory = async (
	interaction: string,
): Promise<MemoryEvaluation | undefined> => {
	try {
		const result = await genAI.models.generateContent({
			model: aiModel,
			contents: interaction,
			config: {
				systemInstruction: memoryEvaluationPrompt,
			},
		});

		// You pass the user's *latest* message to sendMessage
		const reply = result.text;

		if (!reply) {
			console.log(
				"⚠️ Seraphina fell out of sync with the divine stream. Try again shortly.",
			);
			return undefined;
		}

		const cleaned = reply
			.replace(/```json/g, "")
			.replace(/```/g, "")
			.trim();

		const parsed: MemoryEvaluation = JSON.parse(cleaned);

		return parsed;
	} catch (err) {
		console.error("Error while executing memory evaluation : ", err);
		return undefined;
	}
};
