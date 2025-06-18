// root file for giveaway commands
import path from "path";
import getAllFiles from "../../utils/getAllFiles";
import { ICommandObj, ISubcommand } from "../../utils/interfaces";
import { isManager, isUser } from "../../utils/permissionsCheck";
import Config from "../../models/configSchema";

const init = async (): Promise<ICommandObj | undefined> => {
  try {
    // fetch all commands from the parent folder and map them to their names
    const subcommandsMap = new Map<string, ISubcommand>();
    const allSubcommandFiles = getAllFiles(
      path.join(__dirname, "", "subcommands"),
      false
    );

    const adminCommands: string[] = [],
      userCommands: string[] = [];

    for (const file of allSubcommandFiles) {
      const module = await import(file);

      if (!module) continue;

      const commandObj: ISubcommand = await module.default();

      // get key string
      const cmdName = file.split("\\").at(-1)!.split(".")[0];
      const cmdKey = cmdName.includes("_")
        ? cmdName.replace("_", "-")
        : cmdName;
      const subcommand = commandObj;
      subcommandsMap.set(cmdKey, subcommand);

      // track admin and user commands for permissions check
      const type = file.split("\\").at(-2)!;

      if (type === "admin") adminCommands.push(cmdName);
      if (type === "user") userCommands.push(cmdName);
      // ignore owner commands, they can only be used by server owner and checked in command logic itself
    }

    return {
      name: "giveaway",
      description: "All commands related to giveaways.",
      options: Array.from(subcommandsMap.entries()).map(
        ([_, subcommand]) => subcommand.data
      ),
      permissionsRequired: [],

      callback: async (client, interaction) => {
        try {
          // for a valid command call the clalback function using map
          const subcommandName = interaction.options.getSubcommand(false);
          const guild = interaction.guild;
          const channel = interaction.channel;

          if (!guild || !channel) {
            await interaction.reply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
            });
            return;
          }

          if (!subcommandName) {
            await interaction.reply({
              content:
                "⚠️ No subcommands detected. Make sure you're using the correct syntax.",
              flags: "Ephemeral",
            });
            return;
          }

          const subCmdKey = subcommandName;
          const subCmd = subcommandsMap.get(subCmdKey);

          if (!subCmd) {
            await interaction.reply({
              content:
                "⚠️ No subcommands detected. Make sure you're using the correct syntax.",
              flags: "Ephemeral",
            });
            return;
          }

          const guildConfig = await Config.findOne({ serverID: guild.id });

          if (!guildConfig) {
            await interaction.editReply(
              "🔍 This server could not be identified. Check if the bot has access."
            );
            return;
          }

          const { raidChannelID } = guildConfig.raidConfig;

          // check permissions
          // command name is gonna be unique for given root command
          if (adminCommands.includes(subcommandName)) {
            if (
              !(await isManager(
                client,
                interaction.user.id,
                guild.id,
                "giveaway"
              ))
            ) {
              await interaction.editReply({
                content:
                  "⚠️ You lack the required permissions to use this command.",
              });
              return;
            }
          }

          if (userCommands.includes(subcommandName)) {
            if (
              !(await isUser(client, interaction.user.id, guild.id, "giveaway"))
            ) {
              await interaction.editReply({
                content:
                  "⚠️ You lack the required permissions to use this command.",
              });
              return;
            }

            // also user related commands can only be used in designated channel
            if (channel.id !== raidChannelID) {
              await interaction.editReply({
                content:
                  "⚠️ You cannot use this command in this channel. Please use it in <#${raidChannelID}>.",
              });
              return;
            }
          }

          // call the function
          await subCmd.callback(client, interaction);
        } catch (err) {
          console.error("Error in giveaway root command callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in giveaway root command : ", err);
    return undefined;
  }
};

export default init;
