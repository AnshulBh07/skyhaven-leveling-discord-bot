// a fucntion that will execute all types of interactionCreate event commands according to local commands

import {
  Client,
  GuildMember,
  Interaction,
  MessageFlags,
  PermissionResolvable,
} from "discord.js";
import getLocalCommands from "../../utils/getLocalCommands";
import Config from "../../models/configSchema";

export const execute = async (client: Client, interaction: Interaction) => {
  try {
    if (!interaction.isChatInputCommand()) return;

    const guildConfig = await Config.findOne({ serverID: interaction.guildId });

    if (!guildConfig) {
      await interaction.reply({
        content: "No guild/server found.",
        flags: "Ephemeral",
      });
      return;
    }

    if (
      guildConfig.levelConfig.blacklistedChannels.includes(
        interaction.channelId
      )
    ) {
      await interaction.reply({
        content: "Commands are not allowed in this channel.",
        flags: "Ephemeral",
      });
      return;
    }

    const devsID = guildConfig.devsIDs;

    const localCommands = await getLocalCommands();

    if (!localCommands) {
      await interaction.reply({ content: "No commands found", flags: "Ephemeral" });
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
        await interaction.reply({
          content: "❌ You don't have access to this command.",
          flags: "Ephemeral",
        });
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
          await interaction.reply({
            content: `You need the ${permission} to run this command.`,
            flags: "Ephemeral",
          });
          return;
        }
      }
    }

    // after everything done execute the command callback
    await commandObject.callback(client, interaction);
  } catch (err) {
    console.error(err);
  }
};
