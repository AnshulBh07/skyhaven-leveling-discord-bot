import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  PermissionResolvable,
} from "discord.js";
import { ICommandObj } from "../../../utils/interfaces";
import UserStats from "../../../models/userSchema";
import { getNextLvlXP } from "../../../utils/getNextLevelXP";
import Config from "../../../models/configSchema";

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
        PermissionFlagsBits.ManageGuild as PermissionResolvable,
      ],

      callback: async (client, interaction) => {
        try {
          const targetUser = interaction.options.getUser("user");
          const amount = interaction.options.getNumber("amount");
          const guildId = interaction.guildId;

          if (!targetUser || !amount || !guildId) return;

          const user = await UserStats.findOne({ userID: targetUser.id });
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
          user.leveling.totalXp += amount;

          //   check if a level up has occured
          const xpForNextLvl = getNextLvlXP(user.leveling.level);

          if (user.leveling.xp + amount > xpForNextLvl) {
            // check if a role update has occured
            const preRoleID = user.leveling.currentRole;
            // get new Role id
            const newRoleID = levelRoles.find(
              (role) =>
                role.minLevel! <= user.leveling.level + 1 &&
                role.maxLevel! >= user.leveling.level + 1
            );
          }

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
