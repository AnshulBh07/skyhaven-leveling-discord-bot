import {
  ApplicationCommandOptionType,
  ChannelType,
  EmbedBuilder,
} from "discord.js";
import { IMaze, ISubcommand } from "../../../../utils/interfaces";
import User from "../../../../models/userSchema";
import Maze from "../../../../models/mazeSchema";
import { attachMazeThreadCollector } from "../../../../utils/mazeUtils";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "submit",
        description: "Submit a maze for yourself or some other user.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "start_floor",
            description: "floor from",
            type: ApplicationCommandOptionType.Number,
            min_value: 1,
            max_value: 900,
            required: true,
          },
          {
            name: "end_floor",
            description: "floor to",
            type: ApplicationCommandOptionType.Number,
            min_value: 100,
            max_value: 1000,
            required: true,
          },
          {
            name: "user",
            description: "target user",
            type: ApplicationCommandOptionType.User,
          },
        ],
      },

      // there will be a followup message the will account for submissions, user will send images
      callback: async (client, interaction) => {
        try {
          const targetUser =
            interaction.options.getUser("user") ?? interaction.user;
          const start_floor = interaction.options.getNumber("start_floor");
          const end_floor = interaction.options.getNumber("end_floor");
          const channel = interaction.channel;
          const guild = interaction.guild;

          if (
            !start_floor ||
            !end_floor ||
            !targetUser ||
            !channel ||
            !guild ||
            start_floor >= end_floor
          ) {
            await interaction.reply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
              flags: "Ephemeral",
            });
            return;
          }

          if (channel.type !== ChannelType.GuildText) {
            await interaction.reply({
              content: "Channel is not text-based.",
              ephemeral: true,
            });
            return;
          }

          await interaction.deferReply({ flags: "Ephemeral" });

          // find user
          const user = await User.findOne({
            userID: targetUser.id,
          });

          if (!user) {
            await interaction.editReply({ content: "User not found." });
            return;
          }

          await interaction.editReply({
            content:
              "Maze submission process has started. You will need to provide image proof for every 100th floor you've cleard.",
          });

          const reply = await interaction.fetchReply();

          // the rest of the submission will be handled in an isaloted environment only
          // meant for user, yes we will do it in a thread and attach a collector to it
          const submissionThread = await channel.threads.create({
            name: `${targetUser.username} - Maze Images submissions`,
            autoArchiveDuration: 60,
          });

          // create a new empty maze, we will keep updating it
          const mazeOptions: IMaze = {
            userID: targetUser.id,
            serverID: guild.id,
            messageID: reply.id,
            embedMessageID: reply.id,
            channelID: channel.id,
            submissionThreadID: submissionThread.id,
            imageUrls: [],
            startFloor: start_floor,
            endFloor: end_floor,
            imageHash: "dummy hash",
            status: "pending",
            submittedAt: Date.now(),
            reviewedBy: "dummy admin",
          };

          const newMaze = new Maze(mazeOptions);
          await newMaze.save();

          const subNeeded = (end_floor - start_floor) / 100;

          await submissionThread.send({
            content: `⚠️ Please submit exactly ${subNeeded} image(s) as proof — one for every 100 floors completed.`,
          });

          await attachMazeThreadCollector(client, submissionThread.id);
        } catch (err) {
          console.error("Error in maze submit subcommand callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in maze submit subcommand :", err);
    return undefined;
  }
};

export default init;
