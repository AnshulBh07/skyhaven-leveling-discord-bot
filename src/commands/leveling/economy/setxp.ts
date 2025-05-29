import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  PermissionResolvable,
} from "discord.js";
import { ICommandObj, ILevelRoles } from "../../../utils/interfaces";
import User from "../../../models/userSchema";
import { getLvlFromXP } from "../../../utils/getLevelFromXp";
import { promoteUser } from "../../../utils/promoteUser";
import Config from "../../../models/configSchema";
import { demoteUser } from "../../../utils/demoteUser";

const init = async (): Promise<ICommandObj | undefined> => {
  try {
    return {
      name: "setxp",
      description: "Set a user's XP to a specific amount",
      options: [
        {
          name: "user",
          description: "target user to set",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: "amount",
          description: "amount to set",
          type: ApplicationCommandOptionType.Number,
          required: true,
        },
      ],
      permissionsRequired: [
        PermissionFlagsBits.ManageGuild as PermissionResolvable,
      ],

      callback: async (client, interaction) => {
        try {
          const targetUser = interaction.options.getUser("user");
          const amount = interaction.options.getNumber("amount");
          const guildConfig = await Config.findOne({
            serverID: interaction.guildId,
          });

          if (!targetUser || !amount || !guildConfig || targetUser.bot) {
            interaction.editReply("Invalid command.");
            return;
          }

          const { levelRoles, notificationChannelID } = guildConfig.levelConfig;

          const lvlRolesArray: ILevelRoles[] = levelRoles.map((role) => {
            return {
              roleID: role.roleID,
              minLevel: role.minLevel ?? 1,
              maxLevel: role.maxLevel ?? Infinity,
            };
          });

          const user = await User.findOne({ userID: targetUser.id });

          if (!user) {
            interaction.editReply("No user found.");
            return;
          }

          const levelBefore = getLvlFromXP(user.leveling.totalXp);
          const levelAfter = getLvlFromXP(amount);

          const notifChannel = interaction.guild?.channels.cache.find(
            (channel) => channel.id === notificationChannelID
          );

          if (levelAfter > levelBefore) {
            const { isPromoted, promotionMessage } = await promoteUser(
              user,
              interaction,
              lvlRolesArray,
              levelAfter,
              targetUser
            );

            if (notifChannel && notifChannel.isTextBased()) {
              // send level up message
              await notifChannel.send({
                content: `🎉 <@${targetUser.id}> leveled up! **Level ${levelBefore} ⟶ ${levelAfter}**`,
              });

              if (isPromoted) {
                const lastPromotionTime =
                  user.leveling.lastPromotionTimestamp.getTime();
                const currentTime = new Date().getTime();
                const cooldown = 5000;

                if (currentTime < lastPromotionTime + cooldown) return;

                user.leveling.lastPromotionTimestamp = new Date(currentTime);
                await notifChannel.send({ content: promotionMessage });
              }
            }
          } else if (levelAfter < levelBefore) {
            const { isDemoted, demotionMessage } = await demoteUser(
              user,
              lvlRolesArray,
              levelAfter,
              interaction,
              targetUser
            );

            if (notifChannel && notifChannel.isTextBased()) {
              await notifChannel.send({
                content: `<@${targetUser.id}> has leveled down. 😔 **Level ${levelBefore} ⟶ ${levelAfter}**`,
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
          } else user.leveling.xp = 0;

          user.leveling.totalXp = amount;

          await user.save();
          interaction.editReply(
            `XP set to ${amount} for current level of <@${user.userID}>`
          );
        } catch (err) {
          console.error(err);
        }
      },
    };
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

export default init;
