// utility function to check whether the person to send text on a thread has manager role
import { Client } from "discord.js";
import Config from "../models/configSchema";

// for admin/manager only commands
export const isManager = async (
  client: Client,
  userID: string,
  guildID: string,
  type: string
) => {
  try {
    const guildConfig = await Config.findOne({ serverID: guildID });

    if (!guildConfig) return false;

    const { raidConfig, gquestMazeConfig, giveawayConfig, levelConfig } =
      guildConfig;

    const getManagerRoles = () => {
      switch (type) {
        case "gq":
          return gquestMazeConfig.managerRoles;
        case "mz":
          return gquestMazeConfig.managerRoles;
        case "ga":
          return giveawayConfig.managerRoles;
        case "lvl":
          return levelConfig.managerRoles;
        case "raid":
          return raidConfig.managerRoles;
        default:
          return new Array<string>();
      }
    };

    const managerRoles = getManagerRoles();

    const guild = await client.guilds.fetch({ guild: guildID, force: true });
    const member = await guild.members.fetch({ user: userID, force: true });
    const member_roles = Array.from(member.roles.cache.entries()).map(
      ([_, role]) => role.id
    );

    for (const role of managerRoles) {
      if (member_roles.includes(role)) return true;
    }

    return false;
  } catch (err) {
    console.error("Error in isManager function");
    return false;
  }
};

// for user commands
export const isUser = async (
  client: Client,
  userID: string,
  guildID: string,
  type: string
) => {
  try {
    const guildConfig = await Config.findOne({ serverID: guildID });

    if (!guildConfig) return false;

    const { raidConfig, gquestMazeConfig, giveawayConfig } = guildConfig;

    const getRequiredRole = () => {
      switch (type) {
        case "gq":
          return gquestMazeConfig.gquestRole;
        case "mz":
          return gquestMazeConfig.mazeRole;
        case "ga":
          return giveawayConfig.giveawayRole;
        case "raid":
          return raidConfig.raidRole;
        default:
          return "";
      }
    };

    const requiredRole = getRequiredRole();

    if (!requiredRole.length) return true;

    const guild = await client.guilds.fetch({ guild: guildID, force: true });
    const member = await guild.members.fetch({ user: userID, force: true });
    const member_roles = Array.from(member.roles.cache.entries()).map(
      ([_, role]) => role.id
    );

    return member_roles.includes(requiredRole);
  } catch (err) {
    console.error("Error in isUser function");
    return false;
  }
};
