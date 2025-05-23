import { Client } from "discord.js";

export const execute = (client: Client) => {
  console.log(`${client.user?.username} bot is online.`);
};
