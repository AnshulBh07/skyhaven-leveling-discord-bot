import {
  ApplicationCommand,
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ApplicationCommandOption,
} from "discord.js";
import { ICommandObj } from "./interfaces";

const areOptionsSame = (
  localOptions: ApplicationCommandOptionData[],
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

    const supportsChoices = [
      ApplicationCommandOptionType.String,
      ApplicationCommandOptionType.Integer,
      ApplicationCommandOptionType.Number,
    ].includes(opt1.type);

    // Type narrowing based on known valid types for `choices`
    if (supportsChoices) {
      const localChoices =
        "choices" in opt1 && Array.isArray(opt1.choices) ? opt1.choices : [];
      const appChoices =
        "choices" in opt2 && Array.isArray(opt2.choices) ? opt2.choices : [];

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

export const areCommandsSame = (
  localCommand: ICommandObj,
  appCommand: ApplicationCommand
): boolean => {
  const isNameSame = localCommand.name === appCommand.name;
  const isDescriptionSame = localCommand.description === appCommand.description;

  const localOptions = [...(localCommand.options ?? [])];
  const appOptions = appCommand.options ?? [];

  const optionsSame = areOptionsSame(localOptions, appOptions);

  return isNameSame && isDescriptionSame && optionsSame;
};
