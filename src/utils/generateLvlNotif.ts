import {
  ChatInputCommandInteraction,
  GuildBasedChannel,
  User,
} from "discord.js";
import { ILevelRoles, IUser } from "./interfaces";
import { generateLvlUpCard } from "../canvas/generateLevelUpCard";
import { promoteUser } from "./promoteUser";
import { demoteUser } from "./demoteUser";
import { rolePromotionGifs } from "../data/helperArrays";

// this function will only generate notifs and cards if the level changes
export const generateLvlNotif = async (
  user: IUser,
  targetUser: User,
  prevLevel: number,
  finalLevel: number,
  lvlRolesArr: ILevelRoles[],
  notifChannel: GuildBasedChannel | undefined,
  interaction: ChatInputCommandInteraction
) => {
  try {
    const fullUser = await targetUser.fetch();
    const lvlCard = await generateLvlUpCard(fullUser, prevLevel, finalLevel);

    if (prevLevel < finalLevel) {
      // user levels up
      const { isPromoted, promotionMessage } = await promoteUser(
        user,
        interaction,
        lvlRolesArr,
        finalLevel,
        targetUser
      );

      if (notifChannel && notifChannel.isTextBased()) {
        // send level up message
        await notifChannel.send({
          content: `🎉 <@${targetUser.id}> leveled up! **Level ${prevLevel} ⟶ ${finalLevel}**`,
          files: lvlCard ? [lvlCard] : [],
        });

        if (isPromoted) {
          const idx = lvlRolesArr.findIndex(
            (role) =>
              role.minLevel! <= finalLevel && role.maxLevel! >= finalLevel
          );

          const lastPromotionTime =
            user.leveling.lastPromotionTimestamp.getTime();
          const currentTime = new Date().getTime();
          const cooldown = 5000;

          if (currentTime < lastPromotionTime + cooldown) return;

          user.leveling.lastPromotionTimestamp = new Date(currentTime);
          await notifChannel.send({
            content: promotionMessage,
            files: [
              rolePromotionGifs[idx][
                Math.floor(Math.random() * rolePromotionGifs[idx].length)
              ],
            ],
          });
        }
      }
    } else if (prevLevel > finalLevel) {
      // user loses a level
      const { isDemoted, demotionMessage } = await demoteUser(
        user,
        lvlRolesArr,
        finalLevel,
        interaction,
        targetUser
      );

      if (notifChannel && notifChannel.isTextBased()) {
        await notifChannel.send({
          content: `<@${targetUser.id}> has leveled down. 😔 **Level ${prevLevel} ⟶ ${finalLevel}**`,
          files: lvlCard ? [lvlCard] : [],
        });

        if (isDemoted) {
          const lastPromotionTime =
            user.leveling.lastPromotionTimestamp.getTime();
          const currentTime = new Date().getTime();
          const cooldown = 5000;

          if (currentTime < lastPromotionTime + cooldown) return;

          user.leveling.lastPromotionTimestamp = new Date(currentTime);
          await notifChannel.send({ content: demotionMessage });
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
};
