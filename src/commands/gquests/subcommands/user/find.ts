import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import GQuest from "../../../../models/guildQuestsSchema";

// gives the link to gquest submission message if u have the gquest id
const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "find",
        description: "Find guild quest submission with gquest id.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "gquest_id",
            description: "ID of guild quest",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },

      callback: async (client, interaction) => {
        try {
          const guild = interaction.guild;
          const message_id = interaction.options.getString("gquest_id");

          if (!message_id || !guild) {
            await interaction.reply({
              content: `⚠️ Invalid command. Please check your input and try again.`,
              flags: "Ephemeral",
            });
            return;
          }

          await interaction.deferReply();

          //   find the gquest
          const gquest = await GQuest.findOne({ messageID: message_id });

          if (!gquest) {
            await interaction.editReply({
              content: "📜 No guild quest found.",
            });
            return;
          }

          const messageLink = `https://discord.com/channels/${guild.id}/${gquest.channelID}/${gquest.messageID}`;

          const LinkButton =
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setLabel("Jump to message")
                .setURL(messageLink)
                .setStyle(ButtonStyle.Link)
            );

          await interaction.followUp({
            components: [LinkButton],
            ephemeral: false,
          });
        } catch (err) {
          console.error("Error in gquest find subcommand callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in gquest find subcommand : ", err);
    return undefined;
  }
};

export default init;
