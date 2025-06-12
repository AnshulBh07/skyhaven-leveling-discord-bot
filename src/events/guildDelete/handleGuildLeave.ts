import { Client, Guild } from "discord.js";

const execute = async (client: Client, guild: Guild) => {
  try {
    // efefctively deletes all commands for guild
    await client.application?.commands.set([], guild.id);
    console.log(`✅ Deleted commands for guild ${guild.name}`);
  } catch (err) {
    console.error(`❌ Error deleting commands for guild ${guild.name} : `, err);
  }
};

export default execute;
