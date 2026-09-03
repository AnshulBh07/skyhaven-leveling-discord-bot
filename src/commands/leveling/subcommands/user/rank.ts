import {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  ChannelType,
  PermissionFlagsBits,
} from "discord.js";
import {
  ICardRankData,
  ISubcommand,
  IUser,
} from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";
import User from "../../../../models/userSchema";
import { generateRankCard } from "../../../../canvas/generateRankCard";
import { getNextLvlXP } from "../../../../utils/getNextLevelXP";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "rank",
        description: "Display user level, XP, and rank.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "target user",
            type: ApplicationCommandOptionType.User,
            required: false,
          },
        ],
      },

      callback: async (client, interaction) => {
        try {
          const targetUser =
            interaction.options.getUser("user") ?? interaction.user;
          const guildID = interaction.guildId;
          const channel = interaction.channel;

          if (
            !targetUser ||
            targetUser.bot ||
            !guildID ||
            !channel ||
            channel.type !== ChannelType.GuildText
          ) {
            await interaction.editReply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
            });
            return;
          }

          // channel shouldn't be in blacklisted channels
          const guildConfig = await Config.findOne({
            serverID: guildID,
          }).lean();

          if (!guildConfig) {
            await interaction.editReply(
              "🔍 This server could not be identified. Check if the bot has access."
            );
            return;
          }

          const { notificationChannelID } = guildConfig.levelConfig;

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

          if (
            interaction.channel &&
            notifChannel.isTextBased() &&
            notifChannel.id !== interaction.channel.id
          ) {
            interaction.editReply(
              `⚠️ This command can only be used in <#${notificationChannelID}>.`
            );
            return;
          }

          const targetDoc = await User.findOne({
            userID: targetUser.id,
            serverID: guildID,
          }).lean();

          if (!targetDoc) {
            interaction.editReply("No user found");
            return;
          }

          // count users in this server with higher totalXp to find rank (1-based)
          const higherUsersCount = await User.countDocuments({
            serverID: guildID,
            "leveling.totalXp": { $gt: targetDoc.leveling.totalXp },
          });

          const userRank = higherUsersCount + 1;

          const rankData: ICardRankData = {
            rank: userRank,
            level: targetDoc.leveling.level,
            currentXp: targetDoc.leveling.xp,
            requiredXp: getNextLvlXP(targetDoc.leveling.level),
          };

          const rankCard = await generateRankCard(targetUser, guild, rankData);

          if (!rankCard) {
            console.log("⚠️ rank card generation failed...");
            interaction.editReply("cannot generate rank card.");
            return;
          }

          const image = new AttachmentBuilder(rankCard, {
            name: "rank-card.png",
          });

          await interaction.editReply({ content: "Generating rank card ..." });

          if (notifChannel && notifChannel.isTextBased()) {
            await notifChannel.send({ files: [image] });
          }
        } catch (err) {
          console.error("Error in lvl rank subcommand callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in lvl rank subcommand callback : ", err);
    return undefined;
  }
};

export default init;
