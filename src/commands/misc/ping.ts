import { ICommandObj, ISubcommand } from "../../utils/interfaces";

const init = async (): Promise<ICommandObj | ISubcommand | undefined> => {
  try {
    return {
      name: "ping",
      description: "a test ping command",
      options: [],

      callback: (client, interaction) => {
        interaction.editReply(`Pong! in ${client.ws.ping}ms`);
      },
    };
  } catch (err) {
    console.error("Error loading ping command:", err);
    return undefined;
  }
};

export default init;
