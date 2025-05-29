import { PermissionFlagsBits } from "discord.js";
import { ICommandObj, ILevelRoles } from "../../../utils/interfaces";
import Config from "../../../models/configSchema";
import User from "../../../models/userSchema";

const init = async (): Promise<ICommandObj | undefined> => {
  try {
    return {
      name: "resetserverxp",
      description: "Reset XP and levels for all users in the server",
      options: [],
      permissionsRequired: [
        PermissionFlagsBits.ManageRoles,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.Administrator,
      ],

      callback: async (client, interaction) => {
        try {
          const guildID = interaction.guildId;
          const guildConfig = await Config.findOne({ serverID: guildID });

          if (!guildID || !guildConfig) {
            interaction.editReply("Invalid guild.");
            return;
          }

          const { levelRoles, notificationChannelID } = guildConfig.levelConfig;
          const allRelatedRoles = levelRoles.map((role) => role.roleID);
          const basicRoleId = allRelatedRoles[0];

          const users = await User.find({ serverID: guildID });

          for (const user of users) {
            const guild_member = interaction.guild?.members.cache.find(
              (member) => member.id === user.userID
            );

            if (!guild_member) continue;

            const memberRoles = guild_member.roles.cache.map((role) => role.id);

            // remove all related roles from all users
            for (const role of allRelatedRoles) {
              if (memberRoles.includes(role))
                await guild_member.roles.remove(role);
            }

            // add basicrole
            await guild_member.roles.add(basicRoleId);
          }

          await User.updateMany(
            { serverID: guildID },
            {
              $set: {
                "leveling.xp": 0,
                "leveling.totalXp": 0,
                "leveling.level": 1,
                "leveling.currentRole": basicRoleId,
                "leveling.lastPromotionTimestamp": new Date(),
              },
            }
          );

          interaction.editReply(
            "XP and level has been reset for all users in the server."
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
