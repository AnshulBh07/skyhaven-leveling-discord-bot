import { Client } from "discord.js";

const execute = (client: Client) => {
  if (!client.user) return;

  client.user.setPresence({
    status: "online",
    activities: [
      {
        name: "Server",
        type: 3,
      },
    ],
  });

  console.log(`${client.user.username} bot is online.`);
};

export default execute;
