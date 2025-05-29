import { PermissionFlagsBits } from "discord.js";
import { ICommandObj } from "../../../utils/interfaces";

const init = async (): Promise<ICommandObj | undefined> => {
  try {
    return {
      name: "leaderboard",
      description: "Show top users in the server by level",
      options: [],
      permissionsRequired: [PermissionFlagsBits.SendMessages],

      callback: (client, interaction) => {},
    };
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

export default init;
