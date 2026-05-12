import { Client, Guild } from "discord.js";
import Config from "../../models/configSchema";

const execute = async (client: Client, guild: Guild) => {
  try {
    // also delete guild from config
    await Config.findOneAndDelete({ serverID: guild.id });
  } catch (err) {
    console.error(`❌ Error deleting commands for guild ${guild.name} : `, err);
  }
};

export default execute;
