import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  PermissionResolvable,
} from "discord.js";
import { ILevelRoles, ISubcommand } from "../../../../utils/interfaces";
import User from "../../../../models/userSchema";
import { getLvlFromXP } from "../../../../utils/getLevelFromXp";
import Config from "../../../../models/configSchema";
import { generateLvlNotif } from "../../../../utils/generateLvlNotif";
import { getNextLvlXP } from "../../../../utils/getNextLevelXP";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "setxp",
        description: "Set a user's text XP to a specific amount",
        type: ApplicationCommandOptionType.Subcommand,
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
      },

      callback: async (client, interaction) => {
        try {
          const targetUser = interaction.options.getUser("user");
          const amount = interaction.options.getNumber("amount");
          const guildID = interaction.guildId;

          if (!targetUser || !amount || targetUser.bot || !guildID) {
            await interaction.reply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
              flags: "Ephemeral",
            });
            return;
          }

          await interaction.deferReply({ flags: "Ephemeral" });

          // channel shouldn't be in blacklisted channels
          const guildConfig = await Config.findOne({ serverID: guildID });

          if (!guildConfig) {
            await interaction.editReply(
              "🔍 This server could not be identified. Check if the bot has access."
            );
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

          const user = await User.findOne({
            userID: targetUser.id,
            serverID: guildID,
          });

          if (!user) {
            await interaction.editReply("No user found.");
            return;
          }

          const levelBefore = getLvlFromXP(user.leveling.totalXp);
          const levelAfter = getLvlFromXP(amount);

          const guild = await client.guilds.fetch(guildID);
          const notifChannel = await guild.channels.fetch(
            notificationChannelID,
            { force: true }
          );

          if (!notifChannel) {
            await interaction.editReply({
              content: "Notification channel not found.",
            });
            return;
          }

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

          // maintain text and voice xp ratio
          const oldTotal = user.leveling.textXp + user.leveling.voiceXp;

          if (oldTotal > 0) {
            const textRatio = user.leveling.textXp / oldTotal;
            const voiceRatio = user.leveling.voiceXp / oldTotal;

            user.leveling.textXp = Math.floor(amount * textRatio);
            user.leveling.voiceXp = Math.floor(amount * voiceRatio);

            const discrepancy =
              amount - (user.leveling.textXp + user.leveling.voiceXp);
            user.leveling.textXp += discrepancy;
          } else {
            user.leveling.textXp = Math.floor(amount / 2);
            user.leveling.voiceXp = amount - user.leveling.textXp;
          }

          await user.save();
          await interaction.editReply(
            `XP set to ${amount} for <@${user.userID}>`
          );
        } catch (err) {
          console.error("Error in lvl setxp subcommand callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in lvl setxp subcommand : ", err);
    return undefined;
  }
};

export default init;
