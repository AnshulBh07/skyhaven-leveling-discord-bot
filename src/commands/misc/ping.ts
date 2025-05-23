import { ICommandObj } from "../../utils/interfaces";

const commandObj: ICommandObj = {
  name: "ping",
  description: "a test ping command",

  callback: (client,interaction) => {
    interaction.reply(`Pong! in ${client.ws.ping}`)
  },
};

export default commandObj;
