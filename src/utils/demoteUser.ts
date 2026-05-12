import { ChatInputCommandInteraction, Client, User } from "discord.js";
import { ILevelRoles, IUser } from "./interfaces";
import { roleDemotionMessages } from "../data/helperArrays";

export const demoteUser = async (
  client: Client,
  user: IUser,
  levelRoles: ILevelRoles[],
  finalLevel: number,
  targetUser: User,
  guildID: string
) => {
  let isDemoted = false,
    demotionMessage = "";
  // compare role ids to check for role demotion as well
  const prevRoleID = user.leveling.currentRole;

  const newRoleID = levelRoles.find(
    (role) => role.minLevel! <= finalLevel && role.maxLevel! >= finalLevel
  )?.roleID;

  if (!newRoleID)
    return { isDemoted: isDemoted, demotionMessage: demotionMessage };

  // fetch guild and member data
  const guild = await client.guilds.fetch(guildID);
  const guild_member = await guild.members.fetch(targetUser.id);

  // demotion occured
  if (prevRoleID !== newRoleID) {
    isDemoted = true;

    // check if the guild has the new role
    const newRole = guild.roles.cache.find((role) => role.id === newRoleID);
    const oldRole = guild.roles.cache.find((role) => role.id === prevRoleID);

    if (!newRole || !oldRole)
      return { isDemoted: isDemoted, demotionMessage: demotionMessage };

    const allRelatedRoles = levelRoles.map((role) => role.roleID);
    const memberRoles = guild_member.roles.cache.map((role) => role.id);

    for (const role of allRelatedRoles) {
      if (memberRoles.includes(role)) await guild_member.roles.remove(role);
    }

    await guild_member.roles.add(newRoleID);
    user.leveling.currentRole = newRoleID;

    demotionMessage = roleDemotionMessages[
      Math.floor(Math.random() * roleDemotionMessages.length)
    ]
      .replace("{user}", `<@${targetUser.id}>`)
      .replace("{oldRole}", `${oldRole.name}`)
      .replace("{newRole}", `${newRole.name}`);
  }

  user.leveling.xp = 0;
  user.leveling.level = finalLevel;

  return { isDemoted: isDemoted, demotionMessage: demotionMessage };
};
