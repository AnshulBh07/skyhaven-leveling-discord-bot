import { ApplicationCommandOptionType } from "discord.js";
import { IMaze, ISubcommand } from "../../../../utils/interfaces";
import Maze from "../../../../models/mazeSchema";
import { generateGquestsListEmbed } from "../../../../utils/gquestUtils";
import GQuestMaze from "../../../../models/guildQuestsSchema";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "rejected",
        description:
          "Gives list of all rejected guild mazes. If user is specified gives details for the user only",
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
          const targetUser = interaction.options.getUser("user");
          const guild = interaction.guild;

          if (!guild) {
            await interaction.reply({ content: "Invalid command." });
            return;
          }

          await interaction.deferReply({ flags: "Ephemeral" });

          //   fetch all rejected gquests
          let mazes: IMaze[] = await Maze.find({
            serverID: guild.id,
            status: "rejected",
          });
          let title = "📃 List of all Rejected Guild Mazes";

          if (targetUser) {
            mazes = (mazes as IMaze[]).filter(
              (maze) => maze.userID === targetUser.id
            );
            title = `📃 List of Rejected Guild Mazes for ${targetUser.username}`;
          }

          //   create embed with buttons
          await generateGquestsListEmbed(interaction, mazes, title, "rejected");
        } catch (err) {
          console.error("Error in maze rejected subcommand callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in maze pending subcommand : ", err);
    return undefined;
  }
};

export default init;
