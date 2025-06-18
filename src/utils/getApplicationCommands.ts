import { Client } from "discord.js";

const getApplicationCommands = async (client: Client, guildID?: string) => {
  try {
    if (!client.application) {
      throw new Error(
        "Client application not initialized. Ensure 'ready' event has fired."
      );
    }

    if (guildID) {
      const guild = await client.guilds.fetch(guildID);
      return guild.commands.fetch();
    }

    const globalCommands = await client.application.commands.fetch();
    return globalCommands;
  } catch (err) {
    console.error(err);
  }
};

export default getApplicationCommands;
