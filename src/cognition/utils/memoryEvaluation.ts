import { zodTextFormat } from "openai/helpers/zod.mjs";
import { memoryEvaluationSchema } from "../zodValidation/inferMemoryEvaluation";
import { memoryEvaluationPrompt } from "./seraphinaCognitionPrompts";
import { openai, openaiModel } from "./openai";
import { MemoryEvaluation } from "./memoryArchitectureTypes";

export const evaluateMemory = async (
	interaction: string,
): Promise<MemoryEvaluation | undefined> => {
	try {
		const response = await openai.responses.parse({
			model: openaiModel,

			instructions: memoryEvaluationPrompt,

			input: interaction,

			text: {
				format: zodTextFormat(
					memoryEvaluationSchema,

					"memory_evaluation",
				),
			},
		});

		return response.output_parsed || undefined;
	} catch (err) {
		console.error("Error while evaluating memory:", err);

		return undefined;
	}
};
