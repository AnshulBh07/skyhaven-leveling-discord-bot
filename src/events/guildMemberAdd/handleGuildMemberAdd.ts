import { Client, GuildMember } from "discord.js";
import { createNewUser } from "../../utils/createNewUser";

const execute = async (client: Client, member: GuildMember) => {
  try {
    if (member.user.bot) return;
    
    await createNewUser(client, member.guild.id, member.id);
  } catch (err) {
    console.error(err);
  }
};

export default execute;
