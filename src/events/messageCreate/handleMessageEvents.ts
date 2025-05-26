// a generic function that handles messageCreate events
import { Client, Message } from "discord.js";
import Config from "../../models/configSchema";
import UserStats from "../../models/userSchema";
import { getNextLvlXP } from "../../utils/getNextLevelXP";
import { rolePromotionMessages } from "../../data/helperArrays";
import { countEmojis } from "../../utils/countEmojis";

export const execute = async (client: Client, message: Message) => {
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
    } = guildConfig;

    // check for restrictions
    if (
      message.author.bot ||
      message.content.startsWith("/") ||
      ignoredChannels.includes(message.channel.id) ||
      !message.channel.isTextBased() ||
      notificationChannelID.length === 0
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
    let user = await UserStats.findOne({ userID: message.author.id });

    if (!user) {
      const roleConfig = levelRoles.find((level) => level.minLevel == 1);

      if (!roleConfig) return;

      user = new UserStats({
        userID: message.author.id,
        serverID: guildID,
        xp: 0,
        level: 1,
        lastMessageTimestamp: new Date(),
        lastPromotionTimestamp: new Date(),
        currentRole: roleConfig.roleID,
        totalXp: 0,
      });

      await user.save();

      if (!guildConfig.users.includes(user._id)) {
        guildConfig.users.push(user._id);
        await guildConfig.save();
      }

      // assign role to user
      await message.member?.roles.add(roleConfig.roleID);
      return;
    }

    // check whether user is on cooldown or not
    const currTime = new Date().getTime();
    const cooldownExpTime = user.lastMessageTimestamp.getTime() + xpCooldown;
    if (currTime < cooldownExpTime) return;

    // generate xp for user and check level upgrade
    const xpGain = Math.min(
      Math.max(
        5,
        Math.floor(message.content.length - countEmojis(message.content) / 10)
      ),
      25
    );

    // might need to work on this logic again later as xp gain is negligible can ignore it for now
    const currXp =
      user.xp +
      (hasText && xpFromText ? xpGain : 0) +
      (hasEmojis && xpFromEmojis ? countEmojis(message.content) * 2 : 0) +
      (hasImagesOrGifs && (xpFromAttachments || xpFromEmbeds) ? 5 : 0) +
      (hasVideo && (xpFromAttachments || xpFromEmbeds) ? 10 : 0) +
      (hasStickers && xpFromStickers ? 10 : 0);
    const xpForNextLevel = getNextLvlXP(user.level);

    user.totalXp += currXp - user.xp;

    let promotionFlag = false;
    let lvlupMessage = "";

    // perform a level up if current xp is more than xp required for next level
    if (currXp > xpForNextLevel) {
      const newRoleConfig = levelRoles.find(
        (level) =>
          level.minLevel! <= user.level + 1 && level.maxLevel! >= user.level + 1
      );

      if (!newRoleConfig) return;

      if (newRoleConfig.roleID !== user.currentRole) {
        promotionFlag = true;

        const allRelatedRoles = levelRoles.map((role) => {
          return role.roleID;
        });

        // delete any other level related roles
        for (const role of allRelatedRoles) {
          await message.member?.roles.remove(role);
        }
        // add new role
        await message.member?.roles.add(newRoleConfig.roleID);

        // get role name
        const role = message.guild?.roles.cache.find(
          (role) => role.id === newRoleConfig.roleID
        );

        if (!role) return;

        // now select a level up message for user
        lvlupMessage = rolePromotionMessages[
          Math.floor(Math.random() * rolePromotionMessages.length)
        ]
          .replace("{user}", `<@${message.author.id}>`)
          .replace("{role}", role.name);
      }

      user.level++;
      user.lastMessageTimestamp = new Date();
      user.xp = 0;
      user.currentRole = newRoleConfig.roleID;

      await user.save();

      // send a notification at notif channel
      const notifChannel = message.guild?.channels.cache.find(
        (channel) => channel.id == notificationChannelID
      );

      if (notifChannel && notifChannel.isTextBased()) {
        await notifChannel.send({
          content: `🎉 <@${message.author.id}> leveled up! **Level ${
            user.level - 1
          } ⟶ ${user.level}**`,
        });

        // add promotion debounce
        if (promotionFlag) {
          const lastPromotionTime = user.lastPromotionTimestamp.getTime();
          const currentTime = new Date().getTime();
          const cooldown = 5000;

          if (currentTime < lastPromotionTime + cooldown) return;

          user.lastPromotionTimestamp = new Date(currentTime);
          await user.save();
          await notifChannel.send({ content: lvlupMessage });
        }
      }
    } else {
      // no level up but we still have to update user
      user.xp = currXp;
      user.lastMessageTimestamp = new Date();
      await user.save();
    }
  } catch (err) {
    console.error(err);
  }
};
