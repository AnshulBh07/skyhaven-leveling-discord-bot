import { ChatInputCommandInteraction, User } from "discord.js";
import { ILevelRoles, IUser } from "./interfaces";
import { rolePromotionMessages } from "../data/helperArrays";

export const promoteUser = async (
  user: IUser,
  interaction: ChatInputCommandInteraction,
  levelRoles: ILevelRoles[],
  finalLevel: number,
  targetUser: User
) => {
  // check if a role update has occured
  const prevRoleID = user.leveling.currentRole;
  // get new Role id
  const newRole = levelRoles.find(
    (role) => role.minLevel! <= finalLevel && role.maxLevel! >= finalLevel
  );

  const newRoleID = newRole?.roleID ?? prevRoleID;

  let isPromoted = false;
  let promotionMessage = "";

  if (prevRoleID !== newRoleID) {
    // new role acquired
    isPromoted = true;

    const role = interaction.guild?.roles.cache.find(
      (role) => role.id === newRoleID
    );

    if (!role)
      return { isPromoted: isPromoted, promotionMessage: promotionMessage };

    const allRelatedRoles = levelRoles.map((role) => role.roleID); //all the roles from bot
    const guild_member = await interaction.guild?.members.fetch(targetUser.id);

    if (!guild_member)
      return { isPromoted: isPromoted, promotionMessage: promotionMessage };

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
