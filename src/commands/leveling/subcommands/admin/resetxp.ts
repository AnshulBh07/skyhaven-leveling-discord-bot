import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  PermissionResolvable,
} from "discord.js";
import { ILevelRoles, ISubcommand } from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";
import User from "../../../../models/userSchema";
import { generateLvlNotif } from "../../../../utils/generateLvlNotif";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "resetxp",
        description: "Reset a user's text XP, voice XP and level to 1",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "target user",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },

      callback: async (client, interaction) => {
        try {
          const targetUser = interaction.options.getUser("user");
          const guildID = interaction.guildId;

          if (!targetUser || !guildID || targetUser.bot) {
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

          const { levelRoles, notificationChannelID } = guildConfig.levelConfig;
          const lvlRolesArr: ILevelRoles[] = levelRoles.map((role) => {
            return {
              roleID: role.roleID,
              minLevel: role.minLevel!,
              maxLevel: role.maxLevel!,
            };
          });

          const user = await User.findOne({
            userID: targetUser.id,
            serverID: guildID,
          });

          if (!user) {
            await interaction.editReply("No user found");
            return;
          }

          const prevLevel = user.leveling.level;
          const finalLevel = 1;

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

          if (prevLevel !== finalLevel)
            await generateLvlNotif(
              client,
              user,
              targetUser,
              prevLevel,
              finalLevel,
              lvlRolesArr,
              notifChannel,
              guildID
            );

          user.leveling.xp = 0;
          user.leveling.totalXp = 0;
          user.leveling.voiceXp = 0;
          user.leveling.textXp = 0;
          user.leveling.xpPerDay = new Map<string, number>();

          await user.save();
          await interaction.editReply(
            `⚠️ <@${targetUser.id}> xp is reduced to dust.`
          );
        } catch (err) {
          console.error("Error in lvl resetxp subcommand callback : ",err);
        }
      },
    };
  } catch (err) {
    console.error("Error in lvl resetxp subcommand : ",err);
    return undefined;
  }
};

export default init;
