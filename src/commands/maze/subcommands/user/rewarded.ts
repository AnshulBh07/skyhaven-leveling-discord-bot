import { ApplicationCommandOptionType } from "discord.js";
import { IGquestMaze, ISubcommand } from "../../../../utils/interfaces";
import GQuest from "../../../../models/guildQuestsMazesSchema";
import { generateGquestsListEmbed } from "../../../../utils/gquestUtils";
import GQuestMaze from "../../../../models/guildQuestsMazesSchema";

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
          const targetUser = interaction.options.getUser("user");
          const guild = interaction.guild;

          if (!guild) {
            await interaction.reply({ content: "Invalid command." });
            return;
          }

          await interaction.deferReply({ flags: "Ephemeral" });

          //   fetch all rewarded gquests
          let mazes: IGquestMaze[] = await GQuestMaze.find({
            serverID: guild.id,
            status: "rewarded",
            type: "maze",
          });
          let title = "📃 List of all Rewarded Guild Mazes";

          if (targetUser) {
            mazes = (mazes as IGquestMaze[]).filter(
              (maze) => maze.userID === targetUser.id
            );
            title = `📃 List of Rewarded Guild Mazes for ${targetUser.username}`;
          }

          //   create embed with buttons
          await generateGquestsListEmbed(
            interaction,
            mazes,
            title,
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
