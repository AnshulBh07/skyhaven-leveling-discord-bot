import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  PermissionResolvable,
} from "discord.js";
import { ICommandObj, ILevelRoles } from "../../../utils/interfaces";
import Config from "../../../models/configSchema";
import { getLvlFromXP } from "../../../utils/getLevelFromXp";
import User from "../../../models/userSchema";
import { promoteUser } from "../../../utils/promoteUser";

const init = async (): Promise<ICommandObj | undefined> => {
  try {
    return {
      name: "addxp",
      description: "Add specified amount of XP to a user",
      options: [
        {
          name: "user",
          description: "user to target",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: "amount",
          description: "amount of xp",
          type: ApplicationCommandOptionType.Number,
          required: true,
        },
      ],
      permissionsRequired: [
        PermissionFlagsBits.ManageRoles,
        PermissionFlagsBits.SendMessages,
      ],

      callback: async (client, interaction) => {
        try {
          const targetUser = interaction.options.getUser("user");
          const amount = interaction.options.getNumber("amount");
          const guildId = interaction.guildId;

          if (!targetUser || !amount || !guildId || targetUser.bot) {
            interaction.editReply("Invalid inputs.");
            return;
          }

          if (amount > 5000) {
            interaction.editReply(
              "Cannot add more than 5000 XP points at once."
            );
            return;
          }

          const user = await User.findOne({ userID: targetUser.id });
          const guildConfig = await Config.findOne({ serverID: guildId });

          if (!user) {
            interaction.editReply("No user found.");
            return;
          }

          if (!guildConfig) {
            interaction.editReply("No guild found.");
            return;
          }

          const { levelRoles } = guildConfig.levelConfig;

          user.leveling.xp += amount;
          const finalLevel = getLvlFromXP(user.leveling.totalXp + amount);
          const prevLevel = user.leveling.level;

          const lvlRolesArray: ILevelRoles[] = levelRoles.map((role) => {
            return {
              roleID: role.roleID,
              minLevel: role.minLevel ?? 1,
              maxLevel: role.maxLevel ?? Infinity,
            };
          });

          if (finalLevel > user.leveling.level) {
            const { isPromoted, promotionMessage } = await promoteUser(
              user,
              interaction,
              lvlRolesArray,
              finalLevel,
              targetUser
            );

            const notifChannel = interaction.guild?.channels.cache.find(
              (channel) =>
                channel.id === guildConfig.levelConfig.notificationChannelID
            );

            if (notifChannel && notifChannel.isTextBased()) {
              // send level up message
              await notifChannel.send({
                content: `🎉 <@${targetUser.id}> leveled up! **Level ${prevLevel} ⟶ ${finalLevel}**`,
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
          }

          user.leveling.totalXp += amount;

          await user.save();
          interaction.editReply(`Added ${amount} XP to <@${targetUser.id}>`);
        } catch (err) {
          console.error(err);
          return;
        }
      },
    };
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

export default init;
