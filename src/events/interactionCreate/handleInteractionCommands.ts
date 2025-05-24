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

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const guild = await Config.findOne({ serverID: interaction.guildId });

    if (!guild) {
      interaction.editReply("No guild/server found.");
      return;
    }

    if (guild.blacklistedChannels.includes(interaction.channelId)) {
      interaction.editReply("Commands are not allowed in this channel.");
      return;
    }

    const devsID = guild.devsIDs;

    const localCommands = await getLocalCommands();

    if (!localCommands) {
      interaction.editReply("No commands found");
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
        interaction.editReply({
          content: "❌ You don't have access to this command.",
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
          interaction.editReply({
            content: "You do not have permissions needed to run this command.",
          });
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
