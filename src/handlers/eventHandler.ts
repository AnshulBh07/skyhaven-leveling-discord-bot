import { Client } from "discord.js";
import getAllFiles from "../utils/getAllFiles";
import path from "path";
import { compareStringsLexicographically } from "../utils/compareStrings";

const eventHandler = (client: Client) => {
  // get all event folders
  const eventFolders = getAllFiles(path.join(__dirname, "..", "events"), true);

  for (const eventFolder of eventFolders) {
    // get all files of this folder
    const eventFiles = getAllFiles(eventFolder, false);
    eventFiles.sort(compareStringsLexicographically);

    // get event name from folder name as they are same
    const eventName = eventFolder.replace(/\\/g, "/").split("/").pop();

    if (!eventName) continue;

    client.on(eventName, async (...args) => {
      try {
        // execute event files concurrently so long-running operations do not block independent handlers
        await Promise.all(
          eventFiles.map(async (eventFile) => {
            const module = await import(eventFile);
            await module.default(client, ...args);
          })
        );
      } catch (err) {
        console.error(`Unhandled error executing event '${eventName}':`, err);
      }
    });
  }
};

export default eventHandler;
