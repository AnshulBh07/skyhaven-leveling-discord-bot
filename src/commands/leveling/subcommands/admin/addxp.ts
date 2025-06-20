import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import { ILevelRoles, ISubcommand } from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";
import { getLvlFromXP } from "../../../../utils/getLevelFromXp";
import User from "../../../../models/userSchema";
import { generateLvlNotif } from "../../../../utils/generateLvlNotif";
import { getDateString } from "../../../../utils/getDateString";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "addxp",
        description: "Add specified amount of XP to a user",
        type: ApplicationCommandOptionType.Subcommand,
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
            minValue: 1,
            maxValue: 5000,
            required: true,
          },
        ],
      },

      callback: async (client, interaction) => {
        try {
          const targetUser = interaction.options.getUser("user");
          const amount = interaction.options.getNumber("amount");
          const guildId = interaction.guildId;

          if (!targetUser || !amount || !guildId || targetUser.bot) {
            await interaction.reply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
              flags: "Ephemeral",
            });
            return;
          }

          await interaction.deferReply({ flags: "Ephemeral" });

          const user = await User.findOne({
            userID: targetUser.id,
            serverID: guildId,
          });
          const guildConfig = await Config.findOne({ serverID: guildId });

          if (!user) {
            await interaction.editReply("❌ No user found.");
            return;
          }

          if (!guildConfig) {
            await interaction.editReply("🏰 No matching guild found.");
            return;
          }

          const { levelRoles, notificationChannelID } = guildConfig.levelConfig;

          user.leveling.xp += amount;
          user.leveling.textXp += amount;
          const finalLevel = getLvlFromXP(user.leveling.totalXp + amount);
          const prevLevel = user.leveling.level;
          const dateStr = getDateString(new Date());
          user.leveling.xpPerDay.set(
            dateStr,
            (user.leveling.xpPerDay.get(dateStr) || 0) + amount
          );

          const lvlRolesArray: ILevelRoles[] = levelRoles.map((role) => {
            return {
              roleID: role.roleID,
              minLevel: role.minLevel ?? 1,
              maxLevel: role.maxLevel ?? Infinity,
            };
          });

          const guild = await client.guilds.fetch(guildId);
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
            `✨ Added ${amount} XP to <@${targetUser.id}>!`
          );
        } catch (err) {
          console.error("Error in lvl addxp subcommand callback : ", err);
          return;
        }
      },
    };
  } catch (err) {
    console.error("Error in lvl addxp subcommand  : ", err);
    return undefined;
  }
};

export default init;
