import { Client, GuildMember } from "discord.js";
import User from "../../models/userSchema";
import Config from "../../models/configSchema";

export const execute = async (client: Client, member: GuildMember) => {
  try {
    // function used to insert user in schema when they join guild
    const user = await member.user.fetch();
    const userFromDb = await User.findOne({ userID: member.user.id });
    const guildConfig = await Config.findOne({ serverID: member.guild.id });

    if (!guildConfig) return;
  } catch (err) {
    console.error(err);
  }
};
