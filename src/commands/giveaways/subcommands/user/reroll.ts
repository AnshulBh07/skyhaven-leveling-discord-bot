import {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  ColorResolvable,
  EmbedBuilder,
} from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Giveaway from "../../../../models/giveawaySchema";
import { leaderboardThumbnail } from "../../../../data/helperArrays";
import Config from "../../../../models/configSchema";
import { isManager } from "../../../../utils/permissionsCheck";

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
          {
            name: "user",
            description: "User to reroll",
            type: ApplicationCommandOptionType.User,
          },
        ],
      },

      callback: async (client, interaction) => {
        try {
          const giveaway_id = interaction.options.getString("giveaway_id");
          const guildID = interaction.guildId;
          const targetUser = interaction.options.getUser("user");

          if (!giveaway_id || !guildID) {
            await interaction.editReply({
              content: `⚠️ Invalid command. Please check your input and try again.`,
            });
            return;
          }

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

          const guildConfig = await Config.findOne({ serverID: guildID });

          if (!guildConfig) {
            await interaction.editReply(
              "🔍 This server could not be identified. Check if the bot has access."
            );
            return;
          }

          const isAdmin = await isManager(
            client,
            interaction.user.id,
            guildID,
            "ga"
          );

          if (interaction.user.id !== giveaway.hostID && !isAdmin) {
            await interaction.editReply({
              content: "🚫 You do not have permission to perform this action.",
            });
            return;
          }

          // ALGORITHM -
          // 1. If winner count is 1 just reroll that user, update db
          // 2. if it is greather than 1 use the user specififed in interaction options
          // reroll that particular user only
          const {
            participants,
            serverID,
            channelID,
            prize,
            winnersCount,
            endMessageID,
            winners,
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
                "⚠️ Giveaway data appears to be corrupted. Please try again or contact an admin.",
            });
            return;
          }

          const thumbnail = new AttachmentBuilder(leaderboardThumbnail).setName(
            "thumbnail.png"
          );

          let new_winners: string[] = [];
          const old_winners = winners;
          let newWinner;

          if (winnersCount > 1) {
            if (!targetUser) {
              await interaction.editReply({
                content: "Please specify the user you want to reroll.",
              });
              return;
            }

            const filtered_participants = participants.filter(
              (user) => !old_winners.includes(user)
            );

            newWinner =
              filtered_participants[
                Math.floor(Math.random() * filtered_participants.length)
              ];

            new_winners = old_winners.filter(
              (winner) => winner !== targetUser.id
            );
            new_winners.push(newWinner);

            giveaway.participants = filtered_participants;
            giveaway.winners = new_winners;
            await giveaway.save();
          } else {
            // winner count is 1 choose a random winner
            const filtered_participants = participants.filter(
              (user) => user !== winners[0]
            );

            newWinner =
              filtered_participants[
                Math.floor(Math.random() * filtered_participants.length)
              ];

            new_winners = [newWinner];

            giveaway.winners = new_winners;
            giveaway.participants = filtered_participants;
            await giveaway.save();
          }

          const rerollEmbed = new EmbedBuilder()
            .setTitle(`🎉 Giveaway Rerolled!`)
            .setThumbnail("attachment://thumbnail.png")
            .setDescription(`A new winner has been selected for **${prize}**!`)
            .addFields({
              name: `📢 **New Winner${new_winners.length > 1 ? "s" : ""} : **`,
              value: `${Array.from(new_winners).map(
                (winner) => `${winner === newWinner ? "🆕" : "🎊"} <@${winner}>`
              )}`,
              inline: false,
            })
            .setColor(giveaway.role_color as ColorResolvable)
            .setTimestamp()
            .setFooter({
              text: `Congratulations to the new winner${
                new_winners.length > 1 ? "s" : ""
              }!`,
            });

          await interaction.editReply({
            content: "Reroll process started...",
          });

          const giveawayEndMessage = await channel.messages.fetch(endMessageID);

          await giveawayEndMessage.reply({
            ...(giveaway.role_req
              ? { content: `<@&${giveaway.role_req}>` }
              : null),
            embeds: [rerollEmbed],
            files: [thumbnail],
          });
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
