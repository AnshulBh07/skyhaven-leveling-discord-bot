import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Role,
} from "discord.js";
import { ICommandObj, IGiveaway } from "../../utils/interfaces";
import {
  giveawayStartMessages,
  leaderboardThumbnail,
} from "../../data/helperArrays";
import ms, { StringValue } from "ms";
import Giveaway from "../../models/giveawaySchema";
import { attachCollector, endGiveaway } from "../../utils/giveawayUtils";

const init = async (): Promise<ICommandObj | undefined> => {
  try {
    return {
      name: "gstart",
      description: "Starts a giveaway.",
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
      permissionsRequired: [],

      callback: async (client, interaction) => {
        try {
          const giveawayItem = interaction.options.getString("prize");
          const duration = interaction.options.getString("duration");
          const count_winners = interaction.options.getNumber("winners");
          const role_req = interaction.options.getRole("role");
          const itemImage = interaction.options.getAttachment("image");
          const hosted_by = interaction.options.getUser("host");
          const guildID = interaction.guildId;
          const channelID = interaction.channel?.id;

          // validation
          if (
            !giveawayItem ||
            !duration ||
            !count_winners ||
            !guildID ||
            !channelID
          ) {
            await interaction.reply({
              content: "Invalid giveaway.",
              flags: "Ephemeral",
            });
            return;
          }

          if (giveawayItem.length <= 0) {
            await interaction.reply({
              content: "Prize cannot be an empty string.",
              flags: "Ephemeral",
            });
            return;
          }

          const durationMs = ms(duration as StringValue);

          if (!durationMs || typeof durationMs !== "number") {
            await interaction.reply({
              content:
                "Invalid duration format. Use formats like `1h`, `30m`, `2d`, etc.",
              ephemeral: true,
            });
            return;
          }

          if (
            itemImage &&
            itemImage.contentType &&
            !itemImage.contentType.startsWith("image")
          ) {
            await interaction.reply({
              content: "Please provide a valid image.",
              flags: "Ephemeral",
            });
            return;
          }

          await interaction.deferReply();

          const startMessage =
            giveawayStartMessages[
              Math.floor(Math.random() * giveawayStartMessages.length)
            ];
          const endTime = Date.now() + durationMs;

          const thumbnail = new AttachmentBuilder(leaderboardThumbnail).setName(
            "thumbnail.png"
          );

          const giveawayEmbed = new EmbedBuilder()
            .setTitle(`🎁 SKYHAVEN GIVEAWAY - ${giveawayItem}\n\n`)
            .setThumbnail("attachment://thumbnail.png")
            .setColor(role_req ? role_req.color : "Aqua")
            .setDescription(startMessage)
            .addFields(
              {
                name: "\u200b",
                value: `**👤 Hosted by : ** <@${
                  hosted_by ? hosted_by.id : interaction.user.id
                }>`,
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
              text: "Press 🎉 to participate.\nPress 🏃‍♂️ to leave.\n",
            })
            .setTimestamp(new Date());

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
            content: role_req ? `${role_req}` : "",
            embeds: [giveawayEmbed],
            files: [thumbnail],
            allowedMentions: { roles: role_req ? [role_req.id] : [] },
            components: [buttonRow],
          });

          const giveawayMessage = await interaction.fetchReply();

          // now save giveaway data in mongodb
          const giveawayData: IGiveaway = {
            serverID: guildID,
            hostID: hosted_by ? hosted_by.id : interaction.user.id,
            messageID: giveawayMessage.id,
            channelID: channelID,
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
              });

              if (!freshGiveaway) return;

              await endGiveaway(client, freshGiveaway.messageID);
            }, endTime - Date.now());
        } catch (err) {
          console.error("Error in gstart callback", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in gstart command", err);
    return undefined;
  }
};

export default init;
