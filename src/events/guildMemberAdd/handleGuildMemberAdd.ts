import { Client, GuildMember } from "discord.js";
import { createNewUser } from "../../utils/createNewUser";

export const execute = async (client: Client, member: GuildMember) => {
  try {
    await createNewUser(client, member.guild.id, member.id);
  } catch (err) {
    console.error(err);
  }
};
