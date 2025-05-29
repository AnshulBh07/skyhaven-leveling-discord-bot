import { ChatInputCommandInteraction, User } from "discord.js";
import { ILevelRoles, IUser } from "./interfaces";
import { roleDemotionMessages } from "../data/helperArrays";

export const demoteUser = async (
  user: IUser,
  levelRoles: ILevelRoles[],
  finalLevel: number,
  interaction: ChatInputCommandInteraction,
  targetUser: User
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

  // demotion occured
  if (prevRoleID !== newRoleID) {
    isDemoted = true;

    const allRelatedRoles = levelRoles.map((role) => role.roleID);
    // get all current roles of member
    const guild_member = interaction.guild?.members.cache.find(
      (member) => member.id === targetUser.id
    );

    if (!guild_member) {
      interaction.editReply("Invalid guild member.");
      return { isDemoted: isDemoted, demotionMessage: demotionMessage };
    }

    const memberRoles = guild_member.roles.cache.map((role) => role.id);

    for (const role of allRelatedRoles) {
      if (memberRoles.includes(role)) await guild_member.roles.remove(role);
    }

    await guild_member.roles.add(newRoleID);
    user.leveling.currentRole = newRoleID;

    const oldRole = interaction.guild?.roles.cache.find(
      (role) => role.id === prevRoleID
    );
    const newRole = interaction.guild?.roles.cache.find(
      (role) => role.id === newRoleID
    );

    if (!newRole || !oldRole)
      return { isDemoted: isDemoted, demotionMessage: demotionMessage };

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
