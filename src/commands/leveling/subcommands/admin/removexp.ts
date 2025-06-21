import { ApplicationCommandOptionType } from "discord.js";
import { ILevelRoles, ISubcommand } from "../../../../utils/interfaces";
import { getLvlFromXP } from "../../../../utils/getLevelFromXp";
import Config from "../../../../models/configSchema";
import User from "../../../../models/userSchema";
import { generateLvlNotif } from "../../../../utils/generateLvlNotif";
import { getDateString } from "../../../../utils/getDateString";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "removexp",
        description: "Remove specified amount of XP from a user",
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
          const guildID = interaction.guildId;

          if (!targetUser || !amount || !guildID || targetUser.bot) {
            await interaction.editReply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
            });
            return;
          }

          const guildConfig = await Config.findOne({ serverID: guildID });

          if (!guildConfig) {
            await interaction.editReply(
              "🔍 This server could not be identified. Check if the bot has access."
            );
            return;
          }

          const { levelRoles, notificationChannelID } = guildConfig.levelConfig;

          const user = await User.findOne({
            userID: targetUser.id,
            serverID: guildID,
          });

          if (!user) {
            await interaction.editReply("❌ No user found.");
            return;
          }

          const newCurrXp =
            user.leveling.xp - amount > 0 ? user.leveling.xp - amount : 0;
          const newTotalXp =
            user.leveling.totalXp - amount > 0
              ? user.leveling.totalXp - amount
              : 0;
          const newTextXp =
            user.leveling.textXp - amount > 0
              ? user.leveling.textXp - amount
              : 0;

          user.leveling.xp = newCurrXp;
          user.leveling.totalXp = newTotalXp;
          user.leveling.textXp = newTextXp;

          const dateStr = getDateString(new Date());
          const currPerDay = user.leveling.xpPerDay.get(dateStr) || 0;
          user.leveling.xpPerDay.set(
            dateStr,
            currPerDay - amount > 0 ? currPerDay - amount : 0
          );

          const finalLevel = getLvlFromXP(newTotalXp);
          const lvlRolesArray: ILevelRoles[] = levelRoles.map((role) => {
            return {
              roleID: role.roleID,
              minLevel: role.minLevel ?? 1,
              maxLevel: role.maxLevel ?? Infinity,
            };
          });

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

          // check if user is demoted
          const prevLevel = user.leveling.level;

          if (prevLevel !== finalLevel)
            await generateLvlNotif(
              client,
              user,
              targetUser,
              prevLevel,
              finalLevel,
              lvlRolesArray,
              notifChannel,
              guildID
            );

          await user.save();
          await interaction.editReply(
            `Removed ${amount} XP from <@${targetUser.id}>`
          );
        } catch (err) {
          console.error("Error in lvl removexp subcommand callback : ", err);
          return;
        }
      },
    };
  } catch (err) {
    console.error("Error in lvl removexp subcommand : ", err);
    return undefined;
  }
};

export default init;
