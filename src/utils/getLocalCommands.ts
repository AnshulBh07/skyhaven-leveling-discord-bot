// function that gets all the commands (from commands folder)
import path from "path";
import getAllFiles from "./getAllFiles";
import { ICommandObj } from "./interfaces";

// exceptions contains the list of commands that we want to exclude
const getLocalCommands = async (exceptions?: string[]) => {
  try {
    let localCommands: ICommandObj[] = [];

    //   get all command categories(folders) first
    const commandCategories = getAllFiles(
      path.join(__dirname, "..", "commands"),
      true
    );

    //   now iterate over command folders and get all files
    for (const commandCategory of commandCategories) {
      const commandFiles = getAllFiles(commandCategory, false);

      for (const file of commandFiles) {
        const { default: commandObj }: { default: ICommandObj } = await import(
          file
        );

        // skip commands in exceptions
        if (exceptions && exceptions.includes(commandObj.name)) continue;

        localCommands.push(commandObj);
      }
    }

    return localCommands;
  } catch (err) {
    console.error(err);
  }
};

export default getLocalCommands;
