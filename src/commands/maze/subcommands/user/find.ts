import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Maze from "../../../../models/mazeSchema";

// gives the link to gquest submission message if u have the gquest id
const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "find",
        description: "Find guild maze submission with gquest id.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "maze_id",
            description: "ID of guild maze",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },

      callback: async (client, interaction) => {
        try {
          const guild = interaction.guild;
          const message_id = interaction.options.getString("maze_id");

          if (!message_id || !guild) {
            await interaction.reply({
              content: "Invalid command.",
              flags: "Ephemeral",
            });
            return;
          }

          await interaction.deferReply({ flags: "Ephemeral" });

          //   find the gquest
          const maze = await Maze.findOne({
            messageID: message_id,
            type: "maze",
          });

          if (!maze) {
            await interaction.editReply({ content: "No guild maze found." });
            return;
          }

          const messageLink = `https://discord.com/channels/${guild.id}/${maze.channelID}/${maze.messageID}`;

          const LinkButton =
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setLabel("Jump to message")
                .setURL(messageLink)
                .setStyle(ButtonStyle.Link)
            );

          await interaction.editReply({ components: [LinkButton] });
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
