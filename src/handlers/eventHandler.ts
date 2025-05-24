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
      // iterate over event files and execute them
      for (const eventFile of eventFiles) {
        const { execute } = await import(eventFile);
        await execute(client, ...args);
      }
    });
  }
};

export default eventHandler;
