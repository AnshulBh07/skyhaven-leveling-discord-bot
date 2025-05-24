import { ICommandObj } from "../../utils/interfaces";

const commandObj: ICommandObj = {
  name: "ping",
  description: "a test ping command",
  options: [],

  callback: (client, interaction) => {
    interaction.editReply(`Pong! in ${client.ws.ping}`);
  },
};

export default commandObj;
