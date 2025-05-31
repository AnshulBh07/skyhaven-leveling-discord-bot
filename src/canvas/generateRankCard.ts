import { Guild, User } from "discord.js";
import { discordBadges, xpBarColors } from "../data/helperArrays";
import { Profile } from "discord-arts";
import { ICardRankData } from "../utils/interfaces";

export const generateRankCard = async (
  user: User,
  guild: Guild,
  rankData: ICardRankData
) => {
  try {
    // get official badges from discord
    const userBadges = user.flags?.toArray();

    if (!userBadges) return undefined;

    const allBadges: string[] = [];
    for (const badge of userBadges) {
      allBadges.push(discordBadges.get(badge)!);
    }

    // check if user has nitro by checking if they have a banner or not
    const fullUserInfo = await user.fetch(true);

    if (fullUserInfo.banner && fullUserInfo.banner.length > 0) {
      allBadges.push(discordBadges.get("Nitro")!);
    }

    // check if the user is a server booster
    const guild_member = await guild.members.fetch(user.id);

    const allRoles = guild_member.roles.cache.map((role) => role.name);

    if (allRoles.includes("Server Booster"))
      allBadges.push(discordBadges.get("ServerBooster")!);

    const presenceStatus = guild_member.presence?.status;

    const rankCard = await Profile(user.id, {
      overwriteBadges: true,
      customBadges: allBadges,
      presenceStatus: presenceStatus ?? "offline",
      badgesFrame: true,
      customDate: new Date(),
      moreBackgroundBlur: true,
      backgroundBrightness: 100,
      removeAvatarFrame: false,
      rankData: {
        currentXp: rankData.currentXp,
        requiredXp: rankData.requiredXp,
        rank: rankData.rank,
        level: rankData.level,
        barColor: xpBarColors[Math.floor(Math.random() * xpBarColors.length)],
        levelColor: "#ada8c6",
        autoColorRank: true,
      },
    });

    return rankCard;
  } catch (err) {
    console.error(err);
    return undefined;
  }
};
