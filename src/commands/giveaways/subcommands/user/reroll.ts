import {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  ColorResolvable,
  EmbedBuilder,
} from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Giveaway from "../../../../models/giveawaySchema";
import { leaderboardThumbnail } from "../../../../data/helperArrays";
import { isUser } from "../../../../utils/permissionsCheck";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "reroll",
        description: "Reroll a giveway for new winners",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "giveaway_id",
            description: "ID of the giveaway you want to reroll",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },

      callback: async (client, interaction) => {
        try {
          const giveaway_id = interaction.options.getString("giveaway_id");
          const guildID = interaction.guildId;

          if (!giveaway_id || !guildID) {
            await interaction.reply({
              content: `⚠️ Invalid command. Please check your input and try again.`,
            });
            return;
          }

          await interaction.deferReply();

          const giveaway = await Giveaway.findOne({
            messageID: giveaway_id,
            serverID: guildID,
          });

          if (!giveaway) {
            await interaction.editReply({
              content:
                "🚫 Giveaway not found. Please ensure the provided ID is correct.",
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

          const guild = await client.guilds.fetch({
            guild: serverID,
            force: true,
          });
          const channel = await guild.channels.fetch(channelID, {
            force: true,
          });

          if (!channel || !channel.isTextBased() || endMessageID.length === 0) {
            await interaction.editReply({
              content:
                "Giveaway data appears to be corrupted. Please try again or contact an admin.",
            });
            return;
          }

          if (
            participants.length === 0 ||
            participants.length <= winnersCount
          ) {
            await interaction.editReply({
              content:
                "⚠️ Cannot reroll the giveaway.\nPossible reasons:\n1️⃣ No participants\n2️⃣ 🏆 Winners ≥ 👥 Participants",
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
          console.error("Error in giveaway reroll callback", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in giveaway reroll command", err);
    return undefined;
  }
};

export default init;
