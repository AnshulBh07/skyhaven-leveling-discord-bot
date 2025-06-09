import {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  ColorResolvable,
  EmbedBuilder,
} from "discord.js";
import { ICommandObj } from "../../../utils/interfaces";
import Giveaway from "../../../models/giveawaySchema";
import { leaderboardThumbnail } from "../../../data/helperArrays";

const init = async (): Promise<ICommandObj | undefined> => {
  try {
    return {
      name: "greroll",
      description: "Reroll a giveway for new winners",
      options: [
        {
          name: "giveaway_id",
          description: "ID of the giveaway you want to reroll",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
      permissionsRequired: [],

      callback: async (client, interaction) => {
        try {
          const giveaway_id = interaction.options.getString("giveaway_id");

          if (!giveaway_id) {
            await interaction.reply({
              content: "Invalid command",
              flags: "Ephemeral",
            });
            return;
          }

          const giveaway = await Giveaway.findOne({ messageID: giveaway_id });

          if (!giveaway) {
            await interaction.reply({
              content: "No giveaway found.",
              flags: "Ephemeral",
            });
            return;
          }

          const {
            participants,
            serverID,
            channelID,
            prize,
            winnersCount,
            endMessageID,
          } = giveaway;

          const guild = await client.guilds.fetch(serverID);
          const channel = await guild.channels.fetch(channelID);

          if (!channel || !channel.isTextBased() || endMessageID.length === 0) {
            await interaction.reply({
              content: "Giveaway data is corrupted",
              flags: "Ephemeral",
            });
            return;
          }

          if (
            participants.length === 0 ||
            participants.length <= winnersCount
          ) {
            await interaction.reply({
              content:
                "Cannot reroll giveaway. Possible reaons: \n1. No participants\n2. Number of winners is less than or same as number of participants",
              flags: "Ephemeral",
            });
            return;
          }

          const thumbnail = new AttachmentBuilder(leaderboardThumbnail).setName(
            "thumbnail.png"
          );

          const winners = new Set<string>();

          while (winners.size !== winnersCount) {
            const winner =
              participants[Math.floor(Math.random() * participants.length)];

            if (!winners.has(winner)) winners.add(winner);
          }

          giveaway.winners = Array.from(winners);

          const rerollEmbed = new EmbedBuilder()
            .setTitle(`🎉 Giveaway Rerolled!`)
            .setThumbnail("attachment://thumbnail.png")
            .setDescription(`A new winner has been selected for **${prize}**!`)
            .addFields({
              name: `🆕 **New Winner${winners.size > 1 && "s"}**`,
              value: `${Array.from(winners).map((winner) => `<@${winner}>`)}`,
              inline: false,
            })
            .setColor(giveaway.role_color as ColorResolvable)
            .setTimestamp()
            .setFooter({
              text: `Congratulations to the new winner${
                winners.size > 1 && "s"
              }!`,
            });

          const giveawayEndMessage = await channel.messages.fetch(endMessageID);

          await giveawayEndMessage.reply({
            ...(giveaway.role_req
              ? { content: `<@&${giveaway.role_req}>` }
              : null),
            embeds: [rerollEmbed],
            files: [thumbnail],
          });

          //   save winners
          await giveaway.save();
        } catch (err) {
          console.error("Error in greroll callback", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in greroll command", err);
    return undefined;
  }
};

export default init;
