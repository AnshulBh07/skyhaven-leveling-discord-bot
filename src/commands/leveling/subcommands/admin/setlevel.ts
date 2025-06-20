import { ApplicationCommandOptionType } from "discord.js";
import { ILevelRoles, ISubcommand } from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";
import User from "../../../../models/userSchema";
import { generateLvlNotif } from "../../../../utils/generateLvlNotif";
import { getNextLvlXP } from "../../../../utils/getNextLevelXP";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "setlevel",
        description: "Set a user's level manually",
        type: ApplicationCommandOptionType.Subcommand,
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
            minValue: 1,
            maxValue: 150,
            required: true,
          },
        ],
      },

      callback: async (client, interaction) => {
        try {
          const targetUser = interaction.options.getUser("user");
          const guildID = interaction.guildId;
          const targetLevel = interaction.options.getNumber("level");

          if (!targetUser || !guildID || targetUser.bot || !targetLevel) {
            await interaction.reply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
              flags: "Ephemeral",
            });
            return;
          }

          await interaction.deferReply({ flags: "Ephemeral" });

          const guildConfig = await Config.findOne({ serverID: guildID });

          if (!guildConfig) {
            await interaction.editReply(
              "🔍 This server could not be identified. Check if the bot has access."
            );
            return;
          }

          const user = await User.findOne({
            userID: targetUser.id,
            serverID: guildID,
          });

          if (!user) {
            await interaction.editReply("No user found");
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

          // calculate base xp for this level and set the total xp to it
          let sum = 0;
          for (let i = 1; i < targetLevel; i++) sum += getNextLvlXP(i);

          user.leveling.totalXp = sum + 1;

          // set text and voice xp as old ratio
          const oldTotal = user.leveling.textXp + user.leveling.voiceXp;

          if (oldTotal > 0) {
            const textRatio = user.leveling.textXp / oldTotal;
            const voiceRatio = user.leveling.voiceXp / oldTotal;

            user.leveling.textXp = Math.floor(
              user.leveling.totalXp * textRatio
            );
            user.leveling.voiceXp = Math.floor(
              user.leveling.totalXp * voiceRatio
            );

            // Optional fix to ensure total matches exactly after flooring
            const discrepancy =
              user.leveling.totalXp -
              (user.leveling.textXp + user.leveling.voiceXp);
            user.leveling.textXp += discrepancy;
          } else {
            user.leveling.textXp = Math.floor(user.leveling.totalXp / 2);
            user.leveling.voiceXp =
              user.leveling.totalXp - user.leveling.textXp;
          }

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
          console.error("Error in lvl setlevel subcommand callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in lvl setlevel subcommand callback : ", err);
    return undefined;
  }
};

export default init;
