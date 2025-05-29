import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  PermissionResolvable,
} from "discord.js";
import { ICommandObj, ILevelRoles } from "../../../utils/interfaces";
import Config from "../../../models/configSchema";
import User from "../../../models/userSchema";
import { promoteUser } from "../../../utils/promoteUser";
import { demoteUser } from "../../../utils/demoteUser";

const init = async (): Promise<ICommandObj | undefined> => {
  try {
    return {
      name: "setlevel",
      description: "Set a user's level manually",
      options: [
        {
          name: "user",
          description: "target user",
          type: ApplicationCommandOptionType.User,
        },
        {
          name: "level",
          description: "target level for user",
          type: ApplicationCommandOptionType.Number,
        },
      ],
      permissionsRequired: [
        PermissionFlagsBits.ManageGuild as PermissionResolvable,
      ],

      callback: async (client, interaction) => {
        try {
          const targetUser = interaction.options.getUser("user");
          const targetLevel = interaction.options.getNumber("level");
          const guildID = interaction.guildId;

          if (!targetUser || !targetLevel || !guildID || targetUser.bot) {
            interaction.editReply("Invalid interaction.");
            return;
          }

          const guildConfig = await Config.findOne({ serverID: guildID });
          const user = await User.findOne({ userID: targetUser.id });

          if (!guildConfig || !user) {
            interaction.editReply("invalid guild or user.");
            return;
          }

          const { levelRoles, notificationChannelID } = guildConfig.levelConfig;
          const lvlRolesArr: ILevelRoles[] = levelRoles.map((role) => {
            return {
              roleID: role.roleID,
              minLevel: role.minLevel!,
              maxLevel: role.maxLevel!,
            };
          });

          const prevLevel = user.leveling.level;

          const notifChannel = interaction.guild?.channels.cache.find(
            (channel) => channel.id === notificationChannelID
          );

          if (!notifChannel) {
            interaction.editReply(
              "Incomplete bot configuration for leveling system. Please set the notification channel."
            );
            return;
          }

          if (prevLevel < targetLevel) {
            const { isPromoted, promotionMessage } = await promoteUser(
              user,
              interaction,
              lvlRolesArr,
              targetLevel,
              targetUser
            );

            if (notifChannel && notifChannel.isTextBased()) {
              await notifChannel.send({
                content: `🎉 <@${targetUser.id}> leveled up! **Level ${prevLevel} ⟶ ${targetLevel}**`,
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
          } else if (prevLevel > targetLevel) {
            const { isDemoted, demotionMessage } = await demoteUser(
              user,
              lvlRolesArr,
              targetLevel,
              interaction,
              targetUser
            );

            if (notifChannel && notifChannel.isTextBased()) {
              await notifChannel.send({
                content: `<@${targetUser.id}> has leveled down. 😔 **Level ${prevLevel} ⟶ ${targetLevel}**`,
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
          } else {
            interaction.editReply(
              `<@${targetUser.id}> is already at level ${targetLevel}`
            );
          }

          await user.save();
          interaction.editReply(
            `Set level ${targetLevel} for user <@${targetUser.id}>`
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
