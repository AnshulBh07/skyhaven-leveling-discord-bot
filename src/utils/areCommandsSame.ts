import {
  ApplicationCommand,
  ApplicationCommandOption,
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
} from "discord.js";
import { ICommandObj, IOptions } from "./interfaces";

const areOptionsSame = (
  localOptions: IOptions[],
  appOptions: ApplicationCommandOption[]
): boolean => {
  if (localOptions.length !== appOptions.length) return false;

  const sortedLocal = [...localOptions].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const sortedApp = [...appOptions].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  for (let i = 0; i < sortedLocal.length; i++) {
    const opt1 = sortedLocal[i];
    const opt2 = sortedApp[i];

    if (
      opt1.name !== opt2.name ||
      opt1.description !== opt2.description ||
      opt1.type !== opt2.type
    )
      return false;

    // Check if type supports choices (e.g., STRING, INTEGER, NUMBER)
    const supportsChoices = [
      ApplicationCommandOptionType.String,
      ApplicationCommandOptionType.Integer,
      ApplicationCommandOptionType.Number,
    ].includes(opt1.type);

    if (supportsChoices) {
      const localChoices = opt1.choices ?? [];
      const appChoices =
        "choices" in opt2 && Array.isArray((opt2 as any).choices)
          ? (opt2 as any).choices
          : [];

      if (localChoices.length !== appChoices.length) return false;

      const sortedLocalChoices = [...localChoices].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      const sortedAppChoices = [...appChoices].sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      for (let j = 0; j < sortedLocalChoices.length; j++) {
        const c1 = sortedLocalChoices[j];
        const c2 = sortedAppChoices[j];
        if (c1.name !== c2.name || c1.value !== c2.value) return false;
      }
    }
  }

  return true;
};

// only compare name,description and choices
export const areCommandsSame = (
  localCommand: ICommandObj,
  appCommand: ApplicationCommand
) => {
  const isNameSame = localCommand.name === appCommand.name;
  const isDescriptionSame = localCommand.description === appCommand.description;
  const optionsSame = areOptionsSame(localCommand.options, appCommand.options);

  return isNameSame && isDescriptionSame && optionsSame;
};
