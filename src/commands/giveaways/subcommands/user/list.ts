import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Giveaway from "../../../../models/giveawaySchema";
import { generateGiveawayListEmbed } from "../../../../utils/giveawayUtils";
import { leaderboardThumbnail } from "../../../../data/helperArrays";
import { isUser } from "../../../../utils/permissionsCheck";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "list",
        description:
          "Displays a list of all active giveaways for current server.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [],
      },

      callback: async (client, interaction) => {
        try {
          const guildID = interaction.guildId;

          if (!guildID) {
            await interaction.reply({
              content: `⚠️ Invalid command. Please check your input and try again.`,
            });
            return;
          }

          await interaction.deferReply();

          const guild = await client.guilds.fetch(guildID);

          //   get all the giveaways for current server
          const giveaways = await Giveaway.find({
            serverID: guildID,
            isEnded: false,
          });

          let page = 0;
          const pageSize = 3;
          const totalPages = Math.ceil(giveaways.length / pageSize);

          const description = `🎁 List of Active Giveaways`;

          const embed = generateGiveawayListEmbed(
            giveaways,
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
                  .setCustomId("list_prev")
                  .setEmoji("⬅️")
                  .setDisabled(page === 0)
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId("list_next")
                  .setEmoji("➡️")
                  .setDisabled(page === totalPages - 1)
                  .setStyle(ButtonStyle.Secondary)
              );

            return buttonsRow;
          };

          const initialButtons = generateButtons();

          await interaction.editReply({
            embeds: [embed],
            files: [thumbnail],
            components: [initialButtons],
          });
          const reply = await interaction.fetchReply();

          const collector = reply.createMessageComponentCollector({
            filter: (i) =>
              ["list_prev", "list_next"].includes(i.customId) &&
              i.user.id === interaction.user.id,
            time: 60_000 * 10, //10 minutes
          });

          collector.on("collect", async (btnInt) => {
            try {
              await btnInt.deferUpdate();
              if (btnInt.customId === "list_prev") page--;
              if (btnInt.customId === "list_next") page++;

              const newPage = generateGiveawayListEmbed(
                giveaways,
                page,
                pageSize,
                guild.name,
                description
              );

              const newButtonsRow = generateButtons();
              await interaction.editReply({
                embeds: [newPage],
                components: [newButtonsRow],
              });
            } catch (err) {
              console.error(
                "Error in giveaway list collector on collect : ",
                err
              );
              return;
            }
          });

          collector.on("end", async (collected, reason) => {
            if (reason === "time") {
              await interaction.editReply({
                content: "⏱️ Interaction timeout.",
                components: [],
              });
            }
          });
        } catch (err) {
          console.error("Error in giveaway list callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in giveaway list command :", err);
    return undefined;
  }
};

export default init;
