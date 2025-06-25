// a fucntion that will execute all types of interactionCreate event commands according to local commands
import {
  Client,
  GuildMember,
  Interaction,
  PermissionResolvable,
} from "discord.js";
import getLocalCommands from "../../utils/getLocalCommands";
import Config from "../../models/configSchema";
import { guildConfigCheck } from "../../utils/configurationCheck";
import { IConfig } from "../../utils/interfaces";

const execute = async (client: Client, interaction: Interaction) => {
  try {
    if (!interaction.isChatInputCommand()) return;

    const guild = interaction.guild;

    if (!guild) {
      await interaction.reply({
        content: "Invalid input. Please try again.",
        flags: "Ephemeral",
      });
      return;
    }

    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply({ flags: "Ephemeral" });
    }

    const guildConfig = await Config.findOne({ serverID: guild.id });

    if (!guildConfig) {
      await interaction.editReply({
        content: "No guild/server found.",
      });
      return;
    }

    const { botAdminIDs } = guildConfig.moderationConfig;
    const isAdmin = botAdminIDs.includes(interaction.user.id);
    const { seraphinaMood } = guildConfig.moodConfig;

    const setupCommands: Record<string, string[]> = {
      ga: ["add-admin", "remove-admin", "channel", "use-role"],
      gq: ["add-admin", "remove-admin", "channel", "use-role", "reward-amount"],
      mz: ["channel", "use-role", "reward-amount"],
      lvl: ["add-admin", "remove-admin", "channel", "resetserverxp"],
      raid: [
        "add-admin",
        "remove-admin",
        "channel",
        "tank-emoji",
        "dps-emoji",
        "support-emoji",
        "use-role",
      ],
      mod: [
        "add-admin",
        "remove-admin",
        "setup",
        "farewell-channel",
        "welcome-channel",
      ],
    };

    const cmd = interaction.commandName;
    const sub = interaction.options.getSubcommand(false);

    const isSetupCommand = setupCommands[cmd]?.includes(sub || "");

    // 1. bot must be configured
    // 2. only mod commands are allowed otherwise (mod commands only usable by bot admins)
    if (!guildConfigCheck(guildConfig as unknown as IConfig)) {
      if (isAdmin && isSetupCommand) {
        console.log(
          `Admin command used: ${
            interaction.commandName
          } - ${interaction.options.getSubcommand(false)} for guild ${
            interaction.guild?.name
          }`
        );
      } else {
        await interaction.editReply({
          content: isAdmin
            ? "⚠️ **Server Configuration Not Found**\nAs a bot admin, please initialize the server by running `/mod setup`. This will guide you through the required configuration steps.\n\nUntil it's set up, most features will remain disabled."
            : "⚠️ **Server Not Yet Configured**\nThe bot hasn't been set up for this server. Please contact a server admin or bot manager.",
        });
        return;
      }
    }

    if (
      guildConfig.levelConfig.blacklistedChannels.includes(
        interaction.channelId
      )
    ) {
      await interaction.editReply({
        content: "Commands are not allowed in this channel.",
      });
      return;
    }

    const devsID = guildConfig.devsIDs;

    const localCommands = await getLocalCommands();

    if (!localCommands) {
      await interaction.editReply({
        content: "No commands found",
      });
      return;
    }

    // now find command object from local commands
    const commandObject = localCommands.find(
      (cmd) => cmd.name == interaction.commandName
    );

    if (!commandObject) {
      await interaction.editReply({ content: "Command object doesn't exist" });
      return;
    }

    if (commandObject.devOnly) {
      const memberID = interaction.member?.user.id!;

      //   check devs only
      if (!devsID.includes(memberID)) {
        await interaction.editReply({
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
          await interaction.editReply({
            content: `You need the ${permission} to run this command.`,
          });
          return;
        }
      }
    }

    // after everything done execute the command callback
    await commandObject.callback(client, interaction, seraphinaMood);
  } catch (err) {
    console.error("Error in chat input command interaction handler : ", err);
  }
};

export default execute;
