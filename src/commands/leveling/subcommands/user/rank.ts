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
          }).populate({ path: "users" });

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

          if (!notifChannel) {
            interaction.editReply(
              "Incomplete bot configuration for leveling system. Please set the notification channel."
            );
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

          let users = guildConfig.users as unknown as IUser[];

          users = users.map((user) => {
            return {
              userID: user.userID,
              serverID: user.serverID,
              username: user.username,
              nickname: user.nickname,
              leveling: user.leveling,
              giveaways: user.giveaways,
              gquests: user.gquests,
              mazes: user.mazes,
              raids: user.raids,
            };
          });

          const user = users.find(
            (user) => String(user.userID) === String(targetUser.id)
          );

          if (!user) {
            interaction.editReply("No user found");
            return;
          }

          // sort users based on xp
          users.sort((a, b) => b.leveling.totalXp - a.leveling.totalXp);

          const userRank =
            users.findIndex((user) => user.userID === targetUser.id) + 1;

          const rankData: ICardRankData = {
            rank: userRank,
            level: user.leveling.level,
            currentXp: user.leveling.xp,
            requiredXp: getNextLvlXP(user.leveling.level),
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
