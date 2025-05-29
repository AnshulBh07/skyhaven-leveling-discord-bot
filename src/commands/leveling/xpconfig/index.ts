import path from "path";
import getAllFiles from "../../../utils/getAllFiles";
import { ICommandObj, ISubcommand } from "../../../utils/interfaces";
import { ApplicationCommandOptionType } from "discord.js";

const init = async (): Promise<ICommandObj | ISubcommand | undefined> => {
  try {
    // let us save all the subcommands related to xp config first in a map
    const subcommandsMap = new Map<string, ISubcommand>();
    const subcommandSet = new Set<string>(); //prevents duplicate subcommands

    // first we get all commands
    const commandsFolders = getAllFiles(
      path.join(__dirname, "..", "xpconfig"),
      true
    );

    for (const folder of commandsFolders) {
      const commandFiles = getAllFiles(folder, false);

      //   for all the files check for subcommand
      for (const file of commandFiles) {
        const module = await import(file);

        if (!module) continue;

        const commandObj = await module.default();

        // check if a subcommand
        if (!(commandObj as ICommandObj).name) {
          //check if the subcommand is already present in set
          if (!subcommandSet.has(file)) {
            const commandFolder = folder.split("\\").pop();
            const folderIdx = file
              .split("\\")
              .findIndex((ele) => ele == commandFolder);
            const key = file
              .split("\\")
              .slice(folderIdx)
              .join("/")
              .split(".")[0];

            const subcommand = commandObj as ISubcommand;
            subcommandsMap.set(key, subcommand);
            subcommandSet.add(file);
          }
        }
      }
    }

    const viewSubcommand = subcommandsMap.get("view/view");

    const setSubcommands = Array.from(subcommandsMap.entries())
      .filter(([key, _]) => key.startsWith("set"))
      .map(([_, subcommand]) => subcommand.data);

    return {
      name: "xpconfig",
      description: "Configure server setting for leveling system",
      options: [
        ...(viewSubcommand ? [{ ...viewSubcommand.data }] : []),
        {
          name: "set",
          description: "Set XP configuration options",
          type: ApplicationCommandOptionType.SubcommandGroup,
          options: setSubcommands,
        },
      ],

      callback: async (client, interaction) => {
        const subcommandName = interaction.options.getSubcommand(false);
        const SubcommandGroupName =
          interaction.options.getSubcommandGroup(false);

        if (!subcommandName) {
          interaction.editReply("Subcommand not found.");
          return;
        }

        const subCmdKey = SubcommandGroupName
          ? `${SubcommandGroupName}/${subcommandName}`
          : `${subcommandName}/${subcommandName}`;
        const subcommand = subcommandsMap.get(subCmdKey.replace("-", "_"));

        if (!subcommand) {
          await interaction.editReply(
            `Subcommand "${subcommandName}" not found.`
          );
          return;
        }

        // Call the subcommand callback
        await subcommand.callback(client, interaction);
      },
    };
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

export default init;
