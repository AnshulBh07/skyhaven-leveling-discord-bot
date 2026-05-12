import { Client } from "discord.js";
import Maze from "../../models/mazeSchema";
import { attachMazeThreadCollector } from "../../utils/mazeUtils";
import { attachQuestMazeReviewCollector } from "../../utils/gquestUtils";
import { IMaze } from "../../utils/interfaces";

const execute = async (client: Client) => {
  try {
    const mazes = await Maze.find({ status: "pending" });

    for (const maze of mazes) {
      console.log("🔁 resuming maze : ", maze.messageID);
      // continue thread if non archived
      await attachMazeThreadCollector(client, maze.submissionThreadID);
      // attach fresh button collectors on message
      await attachQuestMazeReviewCollector(client, maze as IMaze, "mz");
    }
  } catch (err) {
    console.error("Error while resuming mazes : ", err);
  }
};

export default execute;
