import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  PermissionResolvable,
} from "discord.js";
import { ICommandObj, ILevelRoles } from "../../../utils/interfaces";
import Config from "../../../models/configSchema";
import User from "../../../models/userSchema";
import { demoteUser } from "../../../utils/demoteUser";
import { generateLvlUpCard } from "../../../canvas/generateLevelUpCard";
import { generateLvlNotif } from "../../../utils/generateLvlNotif";

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
          await interaction.deferReply();
          
          const targetUser = interaction.options.getUser("user");
          const guildID = interaction.guildId;

          if (!targetUser || !guildID || targetUser.bot) {
            await interaction.editReply("Invalid command.");
            return;
          }

          const guildConfig = await Config.findOne({ serverID: guildID });

          if (!guildConfig) {
            await interaction.editReply("No guild found.");
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
            await interaction.editReply("No user found");
            return;
          }

          const prevLevel = user.leveling.level;
          const finalLevel = 1;

          const notifChannel = interaction.guild?.channels.cache.find(
            (channel) => channel.id === notificationChannelID
          );

          if (prevLevel !== finalLevel)
            await generateLvlNotif(
              user,
              targetUser,
              prevLevel,
              finalLevel,
              lvlRolesArr,
              notifChannel,
              interaction
            );

          user.leveling.xp = 0;
          user.leveling.totalXp = 0;
          await user.save();
          await interaction.editReply(
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
