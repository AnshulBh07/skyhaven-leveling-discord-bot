import {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { ICardRankData, ICommandObj, IUser } from "../../../utils/interfaces";
import Config from "../../../models/configSchema";
import { generateRankCard } from "../../../canvas/generateRankCard";
import { getNextLvlXP } from "../../../utils/getNextLevelXP";

const init = async (): Promise<ICommandObj | undefined> => {
  try {
    return {
      name: "rank",
      description: "display user level, XP, and rank.",
      options: [
        {
          name: "user",
          description: "target user",
          type: ApplicationCommandOptionType.User,
        },
      ],
      permissionsRequired: [PermissionFlagsBits.SendMessages],

      callback: async (client, interaction) => {
        try {
          await interaction.deferReply({ flags: "Ephemeral" });
          const guildId = interaction.guildId;
          const targetUser = interaction.options.getUser("user")
            ? interaction.options.getUser("user")
            : interaction.user;
          const guild = interaction.guild;

          if (!guildId || !guild) {
            interaction.editReply("Invalid guild");
            return;
          }

          const guildConfig = await Config.findOne({
            serverID: guildId,
          }).populate({ path: "users" });

          if (!guildConfig || !targetUser || targetUser.bot) {
            interaction.editReply("Invalid user.");
            return;
          }

          const { notificationChannelID } = guildConfig.levelConfig;

          const notifChannel = interaction.guild?.channels.cache.find(
            (channel) => channel.id === notificationChannelID
          );

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
            };
          });

          const user = users.find((user) => user.userID === targetUser.id);

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
            interaction.editReply("cannot generate rank card.");
            return;
          }

          const image = new AttachmentBuilder(rankCard, {
            name: "rank-card.png",
          });

          await interaction.deleteReply();

          if (notifChannel && notifChannel.isTextBased()) {
            notifChannel.send({ files: [image] });
          }
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
