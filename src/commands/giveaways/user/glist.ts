import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { ICommandObj } from "../../../utils/interfaces";
import Giveaway from "../../../models/giveawaySchema";
import { generateGiveawayListEmbed } from "../../../utils/giveawayUtils";
import { leaderboardThumbnail } from "../../../data/helperArrays";

const init = async (): Promise<ICommandObj | undefined> => {
  try {
    return {
      name: "glist",
      description:
        "Displays a list of all active giveaways for current server.",
      options: [],
      permissionsRequired: [],

      callback: async (client, interaction) => {
        try {
          const guildID = interaction.guildId;

          if (!guildID) {
            await interaction.reply({
              content: "Invalid guild",
              flags: "Ephemeral",
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
                  .setCustomId("prev")
                  .setEmoji("⬅️")
                  .setDisabled(page === 0)
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId("next")
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
            filter: (i) => ["prev", "next"].includes(i.customId),
            time: 60_000 * 10, //10 minutes
          });

          collector.on("collect", async (btnInt) => {
            try {
              await btnInt.deferUpdate();
              if (btnInt.customId === "prev") page--;
              if (btnInt.customId === "next") page++;

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
              console.error("Error in collector");
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
          console.error("Error in glist callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in glist command :", err);
    return undefined;
  }
};

export default init;
