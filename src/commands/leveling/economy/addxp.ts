import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import { ICommandObj, ILevelRoles } from "../../../utils/interfaces";
import Config from "../../../models/configSchema";
import { getLvlFromXP } from "../../../utils/getLevelFromXp";
import User from "../../../models/userSchema";
import { generateLvlNotif } from "../../../utils/generateLvlNotif";

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
          await interaction.deferReply();

          const targetUser = interaction.options.getUser("user");
          const amount = interaction.options.getNumber("amount");
          const guildId = interaction.guildId;

          if (!targetUser || !amount || !guildId || targetUser.bot) {
            await interaction.editReply("Invalid inputs.");
            return;
          }

          if (amount > 5000) {
            await interaction.editReply(
              "Cannot add more than 5000 XP points at once."
            );
            return;
          }

          const user = await User.findOne({ userID: targetUser.id });
          const guildConfig = await Config.findOne({ serverID: guildId });

          if (!user) {
            await interaction.editReply("No user found.");
            return;
          }

          if (!guildConfig) {
            await interaction.editReply("No guild found.");
            return;
          }

          const { levelRoles, notificationChannelID } = guildConfig.levelConfig;

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

          const notifChannel = interaction.guild?.channels.cache.find(
            (channel) => channel.id === notificationChannelID
          );

          if (prevLevel !== finalLevel)
            await generateLvlNotif(
              client,
              user,
              targetUser,
              prevLevel,
              finalLevel,
              lvlRolesArray,
              notifChannel,
              guildId
            );
          else user.leveling.xp += amount;

          user.leveling.totalXp += amount;

          await user.save();
          await interaction.editReply(
            `Added ${amount} XP to <@${targetUser.id}>`
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
