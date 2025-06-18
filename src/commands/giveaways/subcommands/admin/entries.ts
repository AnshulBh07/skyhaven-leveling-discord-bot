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
        name: "entries",
        description:
          "Displays list of all the giveaways user has taken part in.",
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

          if (!guild) {
            await interaction.reply({
              content: `⚠️ Invalid command. Please check your input and try again.`,
            });
            return;
          }

          await interaction.deferReply();

          const user = await User.findOne({ userID: targetUser.id }).populate(
            "giveaways.giveawaysEntries"
          );

          if (!user) {
            await interaction.editReply({
              content: `❌ User not found. Please check the input and try again.`,
            });
            return;
          }

          const allGiveaways = user.giveaways
            .giveawaysEntries as unknown as IGiveaway[];
          let page = 0;
          const pageSize = 3;
          const totalPages = Math.ceil(allGiveaways.length / pageSize);

          const description = `📦 List of all the giveaways for ${targetUser.username}`;

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
                  .setCustomId("entries_prev")
                  .setEmoji("⬅️")
                  .setDisabled(page === 0)
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId("entries_next")
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
              ["entries_prev", "entries_next"].includes(i.customId) &&
              i.user.id === interaction.user.id,
            time: 60_000 * 10, //10 minutes
          });

          collector.on("collect", async (btnInt) => {
            try {
              await btnInt.deferUpdate();
              if (btnInt.customId === "entries_prev") page--;
              if (btnInt.customId === "entries_next") page++;

              const newPage = generateGiveawayListEmbed(
                allGiveaways,
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
          console.error("Error in giveaway entries callback :", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in giveaway entries command :", err);
    return undefined;
  }
};

export default init;
