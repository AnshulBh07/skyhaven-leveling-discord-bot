import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  PermissionResolvable,
} from "discord.js";
import { ICommandObj, ILevelRoles } from "../../../utils/interfaces";
import Config from "../../../models/configSchema";
import User from "../../../models/userSchema";
import { demoteUser } from "../../../utils/demoteUser";

const init = async (): Promise<ICommandObj | undefined> => {
  try {
    return {
      name: "resetxp",
      description: "Reset a user's XP and level to 1",
      options: [
        {
          name: "user",
          description: "target user",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
      ],
      permissionsRequired: [
        PermissionFlagsBits.ManageGuild as PermissionResolvable,
      ],

      callback: async (client, interaction) => {
        try {
          const targetUser = interaction.options.getUser("user");
          const guildID = interaction.guildId;

          if (!targetUser || !guildID || targetUser.bot) {
            interaction.editReply("Invalid command.");
            return;
          }

          const guildConfig = await Config.findOne({ serverID: guildID });

          if (!guildConfig) {
            interaction.editReply("No guild found.");
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

          const user = await User.findOne({ userID: targetUser.id });

          if (!user) {
            interaction.editReply("No user found");
            return;
          }

          const currLevel = user.leveling.level;

          //   demotion occurs
          if (currLevel > 1) {
            const { isDemoted, demotionMessage } = await demoteUser(
              user,
              lvlRolesArr,
              1,
              interaction,
              targetUser
            );

            // send level down or role demotion notices
            const notifChannel = interaction.guild?.channels.cache.find(
              (channel) => channel.id === notificationChannelID
            );

            if (notifChannel && notifChannel.isTextBased()) {
              await notifChannel.send({
                content: `<@${
                  targetUser.id
                }> has leveled down. 😔 **Level ${currLevel} ⟶ ${1}**`,
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

          user.leveling.xp = 0;
          user.leveling.totalXp = 0;
          await user.save();
          interaction.editReply(
            `⚠️ <@${targetUser.id}> xp is reduced to dust.`
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
