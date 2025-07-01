// a generic function that handles messageCreate events
import { Client, Message } from "discord.js";
import Config from "../../models/configSchema";
import { countEmojis } from "../../utils/countEmojis";
import User from "../../models/userSchema";
import { ILevelRoles } from "../../utils/interfaces";
import { createNewUser } from "../../utils/createNewUser";
import { getLvlFromXP } from "../../utils/getLevelFromXp";
import { generateLvlNotif } from "../../utils/generateLvlNotif";
import { getDateString } from "../../utils/getDateString";

const execute = async (client: Client, message: Message) => {
  try {
    const guildID = message.guildId;

    if (!guildID) return;

    const guildConfig = await Config.findOne({ serverID: guildID });

    if (!guildConfig) return;

    const {
      ignoredChannels,
      notificationChannelID,
      xpCooldown,
      levelRoles,
      xpFromAttachments,
      xpFromEmbeds,
      xpFromEmojis,
      xpFromStickers,
      xpFromText,
    } = guildConfig.levelConfig;

    // check for restrictions
    if (
      message.author.bot ||
      message.content.startsWith("/") ||
      message.content.startsWith("s!") ||
      ignoredChannels.includes(message.channel.id) ||
      !message.channel.isTextBased() ||
      message.channel.isThread()
    )
      return;

    const hasText = message.content.length > 0;
    // images and gifs are sent as attachments from local machine
    // gifs can also be sent as embeds
    const hasImagesOrGifs =
      message.attachments.some(
        (attachment) =>
          attachment.contentType?.startsWith("image/") ||
          attachment.contentType?.startsWith(".gif")
      ) || message.embeds.some((embed) => embed.data.type?.startsWith("gif"));

    const hasVideo =
      message.attachments.some((attachment) =>
        attachment.contentType?.startsWith("video")
      ) || message.embeds.some((embed) => embed.data.type?.startsWith("video"));

    const hasEmojis = countEmojis(message.content) > 0;
    const hasStickers = message.stickers.size > 0;

    // if message does not exist in userstates make one
    let user = await User.findOne({ userID: message.author.id });

    if (!user) {
      await createNewUser(client, guildID, message.author.id);
      return;
    }

    // check whether user is on cooldown or not
    const currTime = new Date().getTime();
    const cooldownExpTime =
      user.leveling.lastMessageTimestamp.getTime() + xpCooldown;
    if (currTime < cooldownExpTime) return;

    // generate xp for user and check level upgrade
    const xpGain = Math.min(
      Math.max(
        5,
        Math.floor(message.content.length - countEmojis(message.content) / 15)
      ),
      200
    );

    const totalXpGainFromMessage =
      (hasText && xpFromText ? xpGain : 0) +
      (hasEmojis && xpFromEmojis ? countEmojis(message.content) * 2 : 0) +
      (hasImagesOrGifs && (xpFromAttachments || xpFromEmbeds) ? 5 : 0) +
      (hasVideo && (xpFromAttachments || xpFromEmbeds) ? 10 : 0) +
      (hasStickers && xpFromStickers ? 10 : 0);

    const prevLevel = user.leveling.level;
    const finalLevel = getLvlFromXP(
      user.leveling.totalXp + totalXpGainFromMessage
    );

    user.leveling.totalXp += totalXpGainFromMessage;
    user.leveling.textXp += totalXpGainFromMessage;
    const dateStr = getDateString(new Date());
    user.leveling.xpPerDay.set(
      dateStr,
      (user.leveling.xpPerDay.get(dateStr) || 0) + totalXpGainFromMessage
    );
    user.nickname =
      message.guild?.members.cache.find(
        (guild_member) => guild_member.id === message.author.id
      )?.nickname ?? user.username;

    const lvlRolesArr: ILevelRoles[] = levelRoles.map((role) => {
      return {
        roleID: role.roleID,
        minLevel: role.minLevel!,
        maxLevel: role.maxLevel!,
      };
    });

    const notifChannel = message.guild?.channels.cache.find(
      (channel) => channel.id === notificationChannelID
    );

    // perform a level up if different levels
    if (prevLevel !== finalLevel)
      await generateLvlNotif(
        client,
        user,
        message.author,
        prevLevel,
        finalLevel,
        lvlRolesArr,
        notifChannel,
        guildID
      );
    else {
      // no level up but we still have to update user
      user.leveling.xp += totalXpGainFromMessage;
      user.leveling.lastMessageTimestamp = new Date();
    }

    await user.save();
  } catch (err) {
    console.error(err);
  }
};

export default execute;
