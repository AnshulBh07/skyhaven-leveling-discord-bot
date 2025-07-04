import { Client } from "discord.js";
import Config from "../models/configSchema";
import User from "../models/userSchema";
import { ILevelRoles, IUser } from "./interfaces";

export const createNewUser = async (
  client: Client,
  guildID: string,
  userID: string,
  initialConfig = false
) => {
  try {
    const guildConfig = await Config.findOne({ serverID: guildID }).populate({
      path: "users",
    });
    if (!guildConfig) return;

    const { levelConfig, moderationConfig } = guildConfig;
    const usersArr = guildConfig.users as unknown as IUser[];
    const userInGuildConfig = usersArr.some((user) => user.userID === userID);
    const basicRole = (levelConfig.levelRoles as ILevelRoles[]).find(
      (role) => role.minLevel === 1
    );

    if (!basicRole) return;

    // get user info
    const guild = await client.guilds.fetch({ guild: guildID, force: true });

    if (!guild) return;

    const member = await guild.members.fetch(userID);

    // remove all related member roles if they have any
    const allRelatedLevelRoles = levelConfig.levelRoles.map(
      (role) => role.roleID
    );
    // all current roles with member
    const allCurrRoles = member.roles.cache.map((role) => role.id);

    for (const role of allCurrRoles) {
      if (allRelatedLevelRoles.includes(role))
        await member.roles.remove(role, "to create a new user");
    }

    // add new role
    await member.roles.add(basicRole.roleID);

    const options: IUser = {
      userID: userID,
      username: member.user.username,
      nickname: member.nickname || member.user.username,
      serverID: guildID,
      leveling: {
        xp: 0,
        totalXp: 0,
        voiceXp: 0,
        xpPerDay: new Map<string, number>(),
        level: 1,
        textXp: 0,
        lastMessageTimestamp: new Date(),
        lastPromotionTimestamp: new Date(),
        currentRole: basicRole.roleID,
      },
      giveaways: {
        isBanned: false,
        giveawaysEntries: [],
        giveawaysWon: [],
      },
      gquests: {
        dmNotif: true,
        pending: [],
        rejected: [],
        rewarded: [],
        lastRejectionDate: null,
        lastRewardDate: null,
        lastSubmissionDate: null,
        totalRewarded: 0,
      },
      mazes: {
        dmNotif: true,
        pending: [],
        rejected: [],
        rewarded: [],
        lastRejectionDate: null,
        lastRewardDate: null,
        lastSubmissionDate: null,
        totalRewarded: 0,
      },
      raids: {
        dmNotif: true,
        completed: [],
        noShows: [],
        reliability: 0,
      },
    };

    if (userInGuildConfig) {
      // if user is already in guildconfig find and reset the user in users model
      if (!initialConfig)
        await User.findOneAndUpdate(
          { userID: userID, serverID: guild.id },
          { $set: options }
        );
    } else {
      // if the user is in user schema but not in guild
      const user = await User.findOne({ userID: userID, serverID: guild.id });

      if (user) {
        await Config.findOneAndUpdate(
          { serverID: guildID },
          { $push: { users: user._id } }
        );
      } else {
        const newUser = await User.create(options);
        //   put user id in guild config
        await Config.findOneAndUpdate(
          { serverID: guildID },
          { $push: { users: newUser._id } }
        );
      }
    }
  } catch (err) {
    console.error("Error in create new user function : ", err);
  }
};
