// function that gets all the commands (from commands folder)
import path from "path";
import getAllFiles from "./getAllFiles";
import { ICommandObj, ISubcommand } from "./interfaces";

// exceptions contains the list of commands that we want to exclude
const getLocalCommands = async (exceptions?: string[]) => {
  let localCommands: ICommandObj[] = [];

  try {
    //   get all command categories(folders) first
    const commandCategories = getAllFiles(
      path.join(__dirname, "..", "commands"),
      true
    );

    //   now iterate over command folders and get all files
    for (const commandCategory of commandCategories) {
      const commandFiles = getAllFiles(commandCategory, false);

      for (const file of commandFiles) {
        const module = await import(file);

        if (!module) {
          console.log("module undefined");
          continue;
        }

        const commandObj = await module.default();

        // we encounter a subcommand
        if (!(commandObj as ICommandObj).name) continue;

        // skip commands in exceptions
        if (exceptions && exceptions.includes((commandObj as ICommandObj).name))
          continue;

        // check for duplicates
        if (
          !localCommands.some(
            (command) => command.name === (commandObj as ICommandObj).name
          )
        )
          localCommands.push(commandObj as ICommandObj);
      }
    }
  } catch (err) {
    console.error(err);
  }
  return localCommands;
};

export default getLocalCommands;
