// a fucntion that will execute all types of interactionCreate event commands according to local commands

import {
  Client,
  GuildMember,
  Interaction,
  PermissionResolvable,
} from "discord.js";
import getLocalCommands from "../../utils/getLocalCommands";
import { config } from "../../data/config";

export const execute = async (client: Client, interaction: Interaction) => {
  try {
    const { devsID } = config;
    if (!interaction.isChatInputCommand()) return;

    const localCommands = await getLocalCommands();

    if (!localCommands) {
      interaction.reply("No commands found");
      throw new Error("No commands found locally");
    }

    // now find command object from local commands
    const commandObject = localCommands.find(
      (cmd) => cmd.name == interaction.commandName
    );

    if (!commandObject) return;

    if (commandObject.devOnly) {
      const memberID = interaction.member?.user.id!;

      //   check devs only
      if (!devsID.includes(memberID)) {
        interaction.reply("❌ You don't have access to this command.");
        return;
      }
    }

    //   apply permissions logic here
    if (
      commandObject.permissionsRequired?.length &&
      interaction.member instanceof GuildMember
    ) {
      // check for all permissions
      for (const permission of commandObject.permissionsRequired) {
        if (
          !interaction.member?.permissions.has(
            permission as PermissionResolvable
          )
        ) {
          interaction.reply(
            "You do not have permissions needed to run this command."
          );
          break;
        }
      }
    }

    // after everything done execute the command callback
    await commandObject.callback(client, interaction);
  } catch (err) {
    console.error(err);
  }
};
