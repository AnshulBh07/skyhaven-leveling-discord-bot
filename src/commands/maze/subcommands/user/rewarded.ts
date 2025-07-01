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
        name: "rewarded",
        description:
          "Gives list of all rewarded guild mazes. If user is specified gives details for the user only",
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
            await interaction.editReply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
            });
            return;
          }

          //   fetch all rewarded gquests
          let mazes: IMaze[] = await Maze.find({
            serverID: guild.id,
            status: "rewarded",
          });
          let title = "📃 List of all Rewarded Guild Mazes";

          if (targetUser) {
            mazes = (mazes as IMaze[]).filter(
              (maze) => maze.userID === targetUser.id
            );
            title = `📃 List of Rewarded Guild Mazes for ${targetUser.username}`;
          }

          //   create embed with buttons
          await generateGquestsListEmbed(
            client,
            interaction,
            mazes,
            title,
            targetUser.id,
            "rewarded"
          );
        } catch (err) {
          console.error("Error in maze rewarded subcommand callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in maze rewarded subcommand : ", err);
    return undefined;
  }
};

export default init;
