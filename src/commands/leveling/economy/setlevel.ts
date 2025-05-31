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
import { generateLvlUpCard } from "../../../canvas/generateLevelUpCard";
import { generateLvlNotif } from "../../../utils/generateLvlNotif";
import { getNextLvlXP } from "../../../utils/getNextLevelXP";

const init = async (): Promise<ICommandObj | undefined> => {
  try {
    return {
      name: "setlevel",
      description: "Set a user's level manually.",
      options: [
        {
          name: "user",
          description: "target user",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: "level",
          description: "target level for user",
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
          const targetLevel = interaction.options.getNumber("level");
          const guildID = interaction.guildId;

          if (!targetUser || !targetLevel || !guildID || targetUser.bot) {
            await interaction.editReply("Invalid interaction.");
            return;
          }

          const guildConfig = await Config.findOne({ serverID: guildID });
          const user = await User.findOne({ userID: targetUser.id });

          if (!guildConfig || !user) {
            await interaction.editReply("invalid guild or user.");
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

          // calculate base xp for this level and set the total xp to it
          let sum = 0;
          for (let i = 1; i < targetLevel; i++) sum += getNextLvlXP(i);
          user.leveling.totalXp = sum + 1;

          if (prevLevel !== targetLevel)
            await generateLvlNotif(
              client,
              user,
              targetUser,
              prevLevel,
              targetLevel,
              lvlRolesArr,
              notifChannel,
              guildID
            );

          await user.save();
          await interaction.editReply(
            prevLevel !== targetLevel
              ? `Set level ${targetLevel} for user <@${targetUser.id}>`
              : `No level change has occured`
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
