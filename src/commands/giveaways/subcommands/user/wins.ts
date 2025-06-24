import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { IGiveaway, ISubcommand } from "../../../../utils/interfaces";
import User from "../../../../models/userSchema";
import { generateGiveawayListEmbed } from "../../../../utils/giveawayUtils";
import { leaderboardThumbnail } from "../../../../data/helperArrays";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "wins",
        description: "Displays list of all the giveaways won by user.",
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

          const guild = interaction.guild;
          const channel = interaction.channel;

          if (!guild || !channel || channel.type !== 0 || targetUser.bot) {
            await interaction.editReply({
              content: `⚠️ Invalid command. Please check your input and try again.`,
            });
            return;
          }

          const user = await User.findOne({
            userID: targetUser.id,
            serverID: guild.id,
          }).populate("giveaways.giveawaysWon");

          if (!user) {
            await interaction.editReply({ content: "👤 User not found." });
            return;
          }

          const allGiveaways = user.giveaways
            .giveawaysWon as unknown as IGiveaway[];
          let page = 0;
          const pageSize = 3;
          const totalPages = Math.ceil(allGiveaways.length / pageSize);

          const description = `🎁 List of all the giveaways ${targetUser.username} has won.`;
          const embed = generateGiveawayListEmbed(
            allGiveaways,
            page,
            pageSize,
            guild.name,
            description
          );

          const thumbnail = new AttachmentBuilder(leaderboardThumbnail).setName(
            "thumbnail.png"
          );

          const generateButtons = () => {
            const buttonsRow =
              new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                  .setCustomId("wins_prev")
                  .setEmoji("⬅️")
                  .setDisabled(page === 0)
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId("wins_next")
                  .setEmoji("➡️")
                  .setDisabled(page === totalPages - 1)
                  .setStyle(ButtonStyle.Secondary)
              );

            return buttonsRow;
          };

          const initialButtons = generateButtons();

          await interaction.editReply({ content: "Processing your data..." });

          const winsMsg = await channel.send({
            embeds: [embed],
            files: [thumbnail],
            components: [initialButtons],
          });

          const collector = winsMsg.createMessageComponentCollector({
            filter: (i) =>
              ["wins_prev", "wins_next"].includes(i.customId) &&
              i.user.id === interaction.user.id,
            time: 60_000 * 10, //10 minutes
          });

          collector.on("collect", async (btnInt) => {
            try {
              await btnInt.deferUpdate();
              if (btnInt.customId === "wins_prev") page--;
              if (btnInt.customId === "wins_next") page++;

              const newPage = generateGiveawayListEmbed(
                allGiveaways,
                page,
                pageSize,
                guild.name,
                description
              );

              const newButtonsRow = generateButtons();
              await winsMsg.edit({
                embeds: [newPage],
                components: [newButtonsRow],
              });
            } catch (err) {
              console.error(
                "Error in giveaway wins collector on collect : ",
                err
              );
              return;
            }
          });

          collector.on("end", async (collected, reason) => {
            if (reason === "time") {
              await winsMsg.edit({
                content: "⏱️ Interaction timeout.",
                components: [],
              });
            }
          });
        } catch (err) {
          console.error("Error in giveaway entries callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in giveaway entries command :", err);
    return undefined;
  }
};

export default init;
