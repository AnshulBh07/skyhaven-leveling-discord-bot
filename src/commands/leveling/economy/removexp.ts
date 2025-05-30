import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  PermissionResolvable,
} from "discord.js";
import { ICommandObj, ILevelRoles } from "../../../utils/interfaces";
import { getLvlFromXP } from "../../../utils/getLevelFromXp";
import Config from "../../../models/configSchema";
import User from "../../../models/userSchema";
import { demoteUser } from "../../../utils/demoteUser";
import { generateLvlUpCard } from "../../../canvas/generateLevelUpCard";
import { generateLvlNotif } from "../../../utils/generateLvlNotif";

const init = async (): Promise<ICommandObj | undefined> => {
  try {
    return {
      name: "removexp",
      description: "Remove specified amount of XP from a user",
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
        PermissionFlagsBits.ManageGuild as PermissionResolvable,
      ],

      callback: async (client, interaction) => {
        try {
          await interaction.deferReply();
          
          const targetUser = interaction.options.getUser("user");
          const amount = interaction.options.getNumber("amount");
          const guildID = interaction.guildId;

          if (!targetUser || !amount || !guildID || targetUser.bot) {
            await interaction.editReply("Invalid command.");
            return;
          }

          if (amount > 5000) {
            await interaction.editReply(
              "Cannot remove more than 5000 XP points at once"
            );
            return;
          }

          const guildConfig = await Config.findOne({ serverID: guildID });

          if (!guildConfig) {
            await interaction.editReply("No guild foun.");
            return;
          }

          const { levelRoles, notificationChannelID } = guildConfig.levelConfig;

          const user = await User.findOne({ userID: targetUser.id });

          if (!user) {
            await interaction.editReply("No user found.");
            return;
          }

          const newCurrXp =
            user.leveling.xp - amount > 0 ? user.leveling.xp - amount : 0;
          const newTotalXp =
            user.leveling.totalXp - amount > 0
              ? user.leveling.totalXp - amount
              : 0;

          user.leveling.xp = newCurrXp;

          user.leveling.totalXp = newTotalXp;

          const finalLevel = getLvlFromXP(newTotalXp);
          const lvlRolesArray: ILevelRoles[] = levelRoles.map((role) => {
            return {
              roleID: role.roleID,
              minLevel: role.minLevel ?? 1,
              maxLevel: role.maxLevel ?? Infinity,
            };
          });

          const notifChannel = interaction.guild?.channels.cache.find(
            (channel) => channel.id === notificationChannelID
          );

          // check if user is demoted
          const prevLevel = user.leveling.level;

          if (prevLevel !== finalLevel)
            await generateLvlNotif(
              user,
              targetUser,
              prevLevel,
              finalLevel,
              lvlRolesArray,
              notifChannel,
              interaction
            );

          await user.save();
          await interaction.editReply(
            `Removed ${amount} XP from <@${targetUser.id}>`
          );
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
