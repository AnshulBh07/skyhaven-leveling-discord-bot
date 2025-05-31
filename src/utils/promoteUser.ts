import { ChatInputCommandInteraction, Client, User } from "discord.js";
import { ILevelRoles, IUser } from "./interfaces";
import { rolePromotionMessages } from "../data/helperArrays";

export const promoteUser = async (
  client: Client,
  user: IUser,
  levelRoles: ILevelRoles[],
  finalLevel: number,
  targetUser: User,
  guildID: string
) => {
  // check if a role update has occured
  const prevRoleID = user.leveling.currentRole;
  // get new Role id
  const newRole = levelRoles.find(
    (role) => role.minLevel! <= finalLevel && role.maxLevel! >= finalLevel
  );

  const newRoleID = newRole?.roleID ?? prevRoleID;

  // fetch guild and member data
  const guild = await client.guilds.fetch(guildID);
  const guild_member = await guild.members.fetch(targetUser.id);

  let isPromoted = false;
  let promotionMessage = "";

  if (prevRoleID !== newRoleID) {
    // new role acquired
    isPromoted = true;

    const role = guild.roles.cache.find((role) => role.id === newRoleID);

    if (!role)
      return { isPromoted: isPromoted, promotionMessage: promotionMessage };

    const allRelatedRoles = levelRoles.map((role) => role.roleID); //all the roles from bot
    const memberRoles = guild_member.roles.cache.map((role) => role.id);

    // delete all prev roles
    for (const role of allRelatedRoles) {
      if (memberRoles.includes(role)) await guild_member.roles.remove(role);
    }

    // add new role
    await guild_member.roles.add(newRoleID);
    user.leveling.currentRole = newRoleID;

    promotionMessage = rolePromotionMessages[
      Math.floor(Math.random() * rolePromotionMessages.length)
    ]
      .replace("{user}", `<@${targetUser.id}>`)
      .replace("{role}", role.name);
  }

  user.leveling.xp = 0;
  user.leveling.level = finalLevel;

  return { isPromoted: isPromoted, promotionMessage: promotionMessage };
};
