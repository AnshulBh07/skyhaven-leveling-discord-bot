import { Client, Guild } from "discord.js";
import getLocalCommands from "../../utils/getLocalCommands";
import getApplicationCommands from "../../utils/getApplicationCommands";
import { areCommandsSame } from "../../utils/areCommandsSame";
import { subcommandsMap } from "../../data/helperArrays";

export const execute = async (client: Client, guild: Guild) => {
  try {
    // get local commands (in file system)
    const localCommands = await getLocalCommands();

    const commandManager = guild.commands;
    const appCommands = await getApplicationCommands(client, guild.id);

    if (!appCommands) {
      console.log(
        `No application commands found for the the server named ${guild.name}`
      );
      return;
    }


    for (const localCommand of localCommands) {
      const { isDeleted, callback, ...command } = localCommand;
      // check if local command exists in application command
      const existingCommand = appCommands.find(
        (cmd) => (cmd.name = localCommand.name)
      );

      // if command does not exist then create one
      if (!existingCommand) {
        await commandManager.create(command);
        console.log(
          `✅ Command ${command.name} created successfully for guild ${guild.name}`
        );
      } else {
        // first check if the command is deleted
        if (isDeleted) {
          await commandManager.delete(existingCommand);
          console.log(
            `🗑️ Command ${command.name} deleted for guild ${guild.name}.`
          );
          continue;
        }

        // check if commands are same or not
        if (!areCommandsSame(localCommand, existingCommand)) {
          await commandManager.edit(existingCommand, { ...command });
          console.log(
            `👍 Command ${command.name} updated successfully for guild ${guild.name}.`
          );
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
};
