import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  Role,
} from "discord.js";
import { IGiveaway, ISubcommand } from "../../../../utils/interfaces";
import {
  giveawayStartMessages,
  leaderboardThumbnail,
} from "../../../../data/helperArrays";
import ms, { StringValue } from "ms";
import Giveaway from "../../../../models/giveawaySchema";
import { attachCollector, endGiveaway } from "../../../../utils/giveawayUtils";
import Config from "../../../../models/configSchema";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "start",
        description: "Starts a giveaway.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "prize",
            description: "item to giveaway",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "duration",
            description: "duration for giveaway. Ex- 1h, 2d, 30m .. etc.",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "winners",
            description: "number of winners",
            type: ApplicationCommandOptionType.Number,
            min_value: 1,
            required: true,
          },
          {
            name: "role",
            description: "role required to enter giveaway",
            type: ApplicationCommandOptionType.Role,
            required: false,
          },
          {
            name: "host",
            description: "hosted by",
            type: ApplicationCommandOptionType.User,
            required: false,
          },
          {
            name: "image",
            description: "screenshot of giveaway item.",
            type: ApplicationCommandOptionType.Attachment,
            required: false,
          },
        ],
      },

      callback: async (client, interaction) => {
        try {
          const giveawayItem = interaction.options.getString("prize");
          const duration = interaction.options.getString("duration");
          const count_winners = interaction.options.getNumber("winners");
          const role_req = interaction.options.getRole("role");
          const itemImage = interaction.options.getAttachment("image");
          const hosted_by =
            interaction.options.getUser("host") ?? interaction.user;
          const guildID = interaction.guildId;
          const guild = interaction.guild;

          // validation
          if (
            !giveawayItem ||
            !duration ||
            !count_winners ||
            !guildID ||
            !hosted_by ||
            hosted_by.bot ||
            !guild
          ) {
            await interaction.editReply({
              content: `⚠️ Invalid command. Please check your input and try again.`,
            });
            return;
          }

          if (giveawayItem.length <= 0) {
            await interaction.editReply({
              content: "🎁 Prize cannot be an empty string.",
            });
            return;
          }

          const durationMs = ms(duration as StringValue);

          if (!durationMs || typeof durationMs !== "number") {
            await interaction.editReply({
              content:
                "Invalid duration format. Use formats like `1h`, `30m`, `2d`, etc.",
            });
            return;
          }

          if (
            itemImage &&
            itemImage.contentType &&
            !itemImage.contentType.startsWith("image")
          ) {
            await interaction.editReply({
              content: "🖼️ Please provide a valid image.",
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

          const { giveawayChannelID } = guildConfig.giveawayConfig;

          // find channel
          const channel = await guild.channels.fetch(giveawayChannelID, {
            force: true,
          });

          if (!channel || channel.type !== ChannelType.GuildText) {
            await interaction.editReply({
              content: "⚠️ Invalid giveaway channel please set up a valid one.",
            });
            return;
          }

          const startMessage =
            giveawayStartMessages[
              Math.floor(Math.random() * giveawayStartMessages.length)
            ];
          const endTime = Date.now() + durationMs;

          const giveawayEmbed = new EmbedBuilder()
            .setTitle(`🎁 GIVEAWAY - ${giveawayItem}\n\n`)
            .setColor(role_req ? role_req.color : "Aqua")
            .setDescription(startMessage)
            .addFields(
              {
                name: "\u200b",
                value: `**👤 Hosted by : ** <@${hosted_by.id}>`,
                inline: true,
              },
              {
                name: "\u200b",
                value: `**🎊 Winners : ** ${count_winners}`,
                inline: true,
              },
              {
                name: "\u200b",
                value: `**⏱️ Ends : ** <t:${Math.floor(
                  endTime / 1000
                )}:R>  *(<t:${Math.floor(endTime / 1000)}:f>)*`,
                inline: false,
              },
              {
                name: "\u200b",
                value: `**Entries : ** ${0} `,
                inline: false,
              },
              ...(role_req
                ? [
                    {
                      name: "\u200b",
                      value: `**🎯 Required Role : ** <@&${role_req.id}>`,
                      inline: true,
                    },
                  ]
                : [])
            )
            .setFooter({
              text: `Press 🎉 to participate.\nPress 🏃‍♂️ to leave.\n${guild.name} Giveaways`,
            })
            .setTimestamp();

          if (itemImage) giveawayEmbed.setImage(itemImage.url);

          //   add a button for participation
          const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId("participate")
              .setEmoji("🎉")
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId("leave")
              .setEmoji("🏃‍♂️")
              .setStyle(ButtonStyle.Danger)
          );

          await interaction.editReply({
            content: "Creating your giveaway. Please wait...",
          });

          const giveawayMessage = await channel.send({
            content: role_req ? `${role_req}` : "",
            embeds: [giveawayEmbed],
            files: [],
            allowedMentions: { roles: role_req ? [role_req.id] : [] },
            components: [buttonRow],
          });

          // now save giveaway data in mongodb
          const giveawayData: IGiveaway = {
            serverID: guildID,
            hostID: hosted_by.id,
            messageID: giveawayMessage.id,
            channelID: channel.id,
            endMessageID: "dummy id",

            prize: giveawayItem,
            winnersCount: count_winners,
            participants: [], //collector will keep updating it
            winners: [],
            imageUrl: itemImage ? itemImage.url : "",
            role_req: role_req ? role_req.id : "",
            role_color: role_req ? (role_req as Role).hexColor : "Aqua",
            starterMessage: startMessage,

            createdAt: Date.now(),
            updatedAt: Date.now(),
            endsAt: endTime,
            isEnded: false,
            isPaused: false,
          };

          const newGiveaway = new Giveaway(giveawayData);
          await newGiveaway.save();

          const collector = await attachCollector(client, newGiveaway);

          // now set a timer
          if (collector)
            setTimeout(async () => {
              collector.stop();
              // to avoid fetching stale state from db fetch a fresh one
              const freshGiveaway = await Giveaway.findOne({
                messageID: newGiveaway.messageID,
                serverID: guildID,
              });

              if (!freshGiveaway) return;

              await endGiveaway(client, freshGiveaway.messageID);
            }, endTime - Date.now());
        } catch (err) {
          console.error("Error in giveaway start callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in giveaway start command : ", err);
    return undefined;
  }
};

export default init;
