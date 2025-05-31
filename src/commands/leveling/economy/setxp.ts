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
import { generateLvlUpCard } from "../../../canvas/generateLevelUpCard";
import { generateLvlNotif } from "../../../utils/generateLvlNotif";
import { getNextLvlXP } from "../../../utils/getNextLevelXP";

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
          await interaction.deferReply();

          const targetUser = interaction.options.getUser("user");
          const amount = interaction.options.getNumber("amount");
          const guildConfig = await Config.findOne({
            serverID: interaction.guildId,
          });
          const guildID = interaction.guildId;

          if (
            !targetUser ||
            !amount ||
            !guildConfig ||
            targetUser.bot ||
            !guildID
          ) {
            await interaction.editReply("Invalid command.");
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
            await interaction.editReply("No user found.");
            return;
          }

          const levelBefore = getLvlFromXP(user.leveling.totalXp);
          const levelAfter = getLvlFromXP(amount);

          const notifChannel = interaction.guild?.channels.cache.find(
            (channel) => channel.id === notificationChannelID
          );

          if (levelAfter !== levelBefore)
            await generateLvlNotif(
              client,
              user,
              targetUser,
              levelBefore,
              levelAfter,
              lvlRolesArray,
              notifChannel,
              guildID
            );

          // calculate leftover amount of xp for user
          let userLevel = user.leveling.level;
          let sum = 0;

          while (--userLevel) {
            const xp = getNextLvlXP(userLevel);
            sum += xp;
          }

          user.leveling.xp = amount - sum;
          user.leveling.totalXp = amount;

          await user.save();
          await interaction.editReply(
            `XP set to ${amount} for <@${user.userID}>`
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
