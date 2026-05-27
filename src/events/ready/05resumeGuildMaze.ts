import { Client } from "discord.js";
import Maze from "../../models/mazeSchema";
import { attachMazeThreadCollector } from "../../utils/mazeUtils";
import { attachQuestMazeReviewCollector } from "../../utils/gquestUtils";
import { IMaze } from "../../utils/interfaces";

const execute = async (client: Client) => {
	try {
		const mazes = await Maze.find({ status: "pending" });

		const resumeMazeThreadCollectors: Promise<any>[] = [],
			resumeMazeReviewCollectors: Promise<any>[] = [];

		for (const maze of mazes) {
			console.log("🔁 resuming maze : ", maze.messageID);

			// continue thread if non archived
			// attach fresh button collectors on message
			resumeMazeThreadCollectors.push(
				attachMazeThreadCollector(client, maze.submissionThreadID),
			);
			resumeMazeReviewCollectors.push(
				attachQuestMazeReviewCollector(client, maze as IMaze, "mz"),
			);
		}

		await Promise.allSettled([
			...resumeMazeThreadCollectors,
			...resumeMazeReviewCollectors,
		]);
	} catch (err) {
		console.error("Error while resuming mazes : ", err);
	}
};

export default execute;
