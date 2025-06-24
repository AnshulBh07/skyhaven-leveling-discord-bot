import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Giveaway from "../../../../models/giveawaySchema";

// gives the link to gquest submission message if u have the gquest id
const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "find",
        description: "Find a giveaway with giveaway ID",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "giveaway_id",
            description: "ID of guild giveaway",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },

      callback: async (client, interaction) => {
        try {
          const guild = interaction.guild;
          const message_id = interaction.options.getString("giveaway_id");
          const channel = interaction.channel;

          if (
            !message_id ||
            !guild ||
            !channel ||
            channel.type !== ChannelType.GuildText
          ) {
            await interaction.editReply({
              content: `⚠️ Invalid command. Please check your input and try again.`,
            });
            return;
          }

          //   find the gquest
          const giveaway = await Giveaway.findOne({ messageID: message_id });

          if (!giveaway) {
            await interaction.editReply({
              content: "📜 No giveaway found.",
            });
            return;
          }

          const messageLink = `https://discord.com/channels/${guild.id}/${giveaway.channelID}/${giveaway.messageID}`;

          const LinkButton =
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setLabel("Jump to message")
                .setURL(messageLink)
                .setStyle(ButtonStyle.Link)
            );

          await interaction.editReply({ content: "Finding your giveaway..." });

          await channel.send({
            components: [LinkButton],
          });
        } catch (err) {
          console.error("Error in giveaway find subcommand callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in giveaway find subcommand : ", err);
    return undefined;
  }
};

export default init;
