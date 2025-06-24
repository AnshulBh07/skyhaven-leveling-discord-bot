import { Client, Guild } from "discord.js";
import Config from "../../models/configSchema";

const execute = async (client: Client, guild: Guild) => {
  try {
    // efefctively deletes all commands for guild
    await client.application?.commands.set([], guild.id);
    console.log(`✅ Deleted commands for guild ${guild.name}`);

    // also delete guild from config
    await Config.findOneAndDelete({ serverID: guild.id });
  } catch (err) {
    console.error(`❌ Error deleting commands for guild ${guild.name} : `, err);
  }
};

export default execute;
