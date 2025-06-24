import { Client, VoiceState } from "discord.js";
import User from "../../models/userSchema";
import { getDateString } from "../../utils/getDateString";
import { getLvlFromXP } from "../../utils/getLevelFromXp";
import { generateLvlNotif } from "../../utils/generateLvlNotif";
import Config from "../../models/configSchema";
import { ILevelRoles } from "../../utils/interfaces";

// a map that keep tracks of when a user has started VC, will be used to calulate total VC time for user
// time is stored in unix epoch for uniformity
const voiceSessions = new Map<string, number>();

const getEligibility = (state: VoiceState) => {
  const channel = state.channel;

  if (!channel) return false;

  // number of members on channel, filter bots
  const members = channel.members.filter((member) => !member.user.bot);
  return (
    !state.selfMute &&
    !state.selfDeaf &&
    members.size > 1 &&
    !state.serverDeaf &&
    !state.serverMute
  );
};

// function that grants xp for user
const grantXp = async (
  client: Client,
  voiceState: VoiceState,
  userID: string,
  joinedAt: number
) => {
  try {
    const now = Date.now();
    // convert the time spent in minutes as we will give 3 xp per minute
    const timeSpentOnVC = (now - joinedAt) / 60_000;
    const xpGain = Math.floor(timeSpentOnVC * 30);
    // get current date string in YYY-MM-DD format
    const dateStr = getDateString(new Date());

    const user = await User.findOne({ userID: userID });

    if (!user) return;

    user.leveling.voiceXp += xpGain;
    user.leveling.totalXp += xpGain;
    user.leveling.xpPerDay.set(
      dateStr,
      (user.leveling.xpPerDay.get(dateStr) || 0) + xpGain
    );

    await user.save();

    //check for level up after granting xp
    const prevLevel = user.leveling.level;
    const finalLevel = getLvlFromXP(user.leveling.totalXp);

    if (prevLevel !== finalLevel) {
      const guildID = voiceState.guild.id;
      const guildConfig = await Config.findOne({ serverID: guildID });

      if (!guildConfig) return;

      const { levelRoles, notificationChannelID } = guildConfig.levelConfig;
      const lvlRolesArr: ILevelRoles[] = levelRoles.map((role) => {
        return {
          roleID: role.roleID,
          minLevel: role.minLevel!,
          maxLevel: role.maxLevel!,
        };
      });

      const notifChannel = voiceState.guild.channels.cache.find(
        (channel) => channel.id === notificationChannelID
      );

      const targetUser = await client.users.fetch(userID);

      await generateLvlNotif(
        client,
        user,
        targetUser,
        prevLevel,
        finalLevel,
        lvlRolesArr,
        notifChannel,
        guildID
      );
    }
  } catch (err) {
    console.error(err);
  }
};

// this file handles voice state update and updates xp from voice
const execute = async (
  client: Client,
  oldState: VoiceState,
  newState: VoiceState
) => {
  try {
    const userId = newState.id;
    const guild = newState.guild;
    const wasEligible = getEligibility(oldState);
    const nowEligible = getEligibility(newState);
    const switchedChannels =
      oldState.channelId &&
      newState.channelId &&
      oldState.channelId !== newState.channelId;

    const guildConfig = await Config.findOne({ serverID: guild.id });

    if (!guildConfig) return;

    const { xpFromVoice } = guildConfig.levelConfig;

    // There are several cases we may encounter
    // 1. user just joined a vc
    if (!wasEligible && nowEligible) {
      // set the map for user
      voiceSessions.set(userId, Date.now());
    }

    // 2. user switched channels
    if (wasEligible && nowEligible && switchedChannels) {
      // here we will end the prev session, add that xp and start a new session
      const joinedAt = voiceSessions.get(userId);
      if (joinedAt) {
        if (xpFromVoice) await grantXp(client, oldState, userId, joinedAt);
        voiceSessions.delete(userId);
      }
      voiceSessions.set(userId, Date.now());
      // return to avoid running of other conditions
      return;
    }

    // 3. lost eligibility (left, muted, alone, etc)
    if (
      (wasEligible && !nowEligible) ||
      (!newState.channelId && voiceSessions.has(userId))
    ) {
      const joinedAt = voiceSessions.get(userId);
      if (joinedAt) {
        if (xpFromVoice) await grantXp(client, oldState, userId, joinedAt);
        voiceSessions.delete(userId);
      }
    }
  } catch (err) {
    console.error(err);
  }
};

export default execute;
