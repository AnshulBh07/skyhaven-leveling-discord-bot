import { aiModel, genAI } from "../../utils/LLMUtils/seraphinaPrompt";

export const generateEmbedding = async (text: string): Promise<number[]> => {
	try {
		const result = await genAI.models.embedContent({
			model: aiModel,
			contents: text,
		});

		if (!result.embeddings) return [];

		const embed = result.embeddings[0].values;

		return embed ? embed : [];
	} catch (err) {
		console.error("Error while generating embeddings using gemini API : ", err);
		return [];
	}
};
