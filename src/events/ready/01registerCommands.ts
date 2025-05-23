import { Client } from "discord.js";
import getApplicationCommands from "../../utils/getApplicationCommands";
import getLocalCommands from "../../utils/getLocalCommands";
import { config } from "../../data/config";
import { areCommandsSame } from "../../utils/areCommandsSame";

export const execute = async (client: Client) => {
  try {
    const { serverID } = config;
    // get local commands (in file system)
    const localCommands = await getLocalCommands();
    // get commands registered with discord bot
    const applicationCommands = await getApplicationCommands(client, serverID);
    const guild = await client.guilds.fetch(serverID);
    const commandManager = guild.commands;

    if (!localCommands || !applicationCommands)
      throw new Error("Invalid commands arrays");

    // console.log(localCommands, applicationCommands);
    // now compare both commands and application commands
    // this is done to synchronize local commands with application commands
    for (const localCommand of localCommands) {
      const { name, isDeleted, description, options } = localCommand;

      //   if the command exists on application as well
      const existingCommand = applicationCommands.find(
        (cmd) => cmd.name == name
      );

      //   if exists
      if (existingCommand) {
        // if the command is marked to be deleted locally delete the command in application by id
        if (isDeleted) {
          applicationCommands.delete(existingCommand.id);
          console.log(`🗑️ ${existingCommand.name} command was deleted.`);
          continue;
        }

        if (!areCommandsSame(localCommand, existingCommand)) {
          await commandManager.edit(existingCommand.id, {
            description,
            options,
          });

          console.log(`✅ Edited command ${name}`);
        }
      } else {
        // if command does not exist make it using command manager
        await commandManager.create({ name, description, options });
        console.log(`✅ Command ${name} created.`);
      }
    }
  } catch (err) {
    console.error(err);
  }
};
