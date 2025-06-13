import path from "path";
import getAllFiles from "../../utils/getAllFiles";
import { ICommandObj, ISubcommand } from "../../utils/interfaces";

const init = async (): Promise<ICommandObj | undefined> => {
  try {
    // fetch all commands from the parent folder and map them to their names
    const subcommandsMap = new Map<string, ISubcommand>();
    const allSubcommandFiles = getAllFiles(
      path.join(__dirname, "..", "raids"),
      false
    );

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
    }

    return {
      name: "raid",
      description: "All commands related to guild raids.",
      options: Array.from(subcommandsMap.entries()).map(
        ([_, subcommand]) => subcommand.data
      ),
      permissionsRequired: [],

      callback: async (client, interaction) => {
        try {
          // for a valid command call the clalback function using map
          const subcommandName = interaction.options.getSubcommand(false);

          if (!subcommandName) {
            await interaction.reply({
              content: "Subcommands not found.",
              flags: "Ephemeral",
            });
            return;
          }

          const subCmdKey = subcommandName;
          const subCmd = subcommandsMap.get(subCmdKey);

          if (!subCmd) {
            await interaction.reply({
              content: "Subcommand not found",
              flags: "Ephemeral",
            });
            return;
          }

          // call the function
          await subCmd.callback(client, interaction);
        } catch (err) {
          console.error("Error in raid root command callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in raid root command : ", err);
    return undefined;
  }
};

export default init;
