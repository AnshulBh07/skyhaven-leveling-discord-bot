import { ApplicationCommandOptionType, ChannelType } from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";
import Maze from "../../../../models/mazeSchema";
import { isManager } from "../../../../utils/permissionsCheck";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "delete",
        description: "Delete a created guild maze submission",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "maze_id",
            description: "ID of maze to be deleted.",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },

      callback: async (client, interaction) => {
        try {
          const guild = interaction.guild;
          const maze_id = interaction.options.getString("maze_id");

          if (!maze_id || !guild) {
            await interaction.editReply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
            });
            return;
          }

          const maze = await Maze.findOne({
            serverID: guild.id,
            embedMessageID: maze_id,
          });

          if (!maze) {
            await interaction.editReply({
              content:
                "🚫 Guild maze submission not found. Please ensure the provided ID is correct.",
            });
            return;
          }

          const { status, channelID, embedMessageID, messageID } = maze;

          if (status !== "pending") {
            await interaction.editReply({
              content:
                "⚠️ You cannot delete a maze submission that has already been completed.",
            });
            return;
          }

          const guildConfig = await Config.findOne({ serverID: guild.id });

          if (!guildConfig) {
            await interaction.editReply(
              "🔍 This server could not be identified. Check if the bot has access."
            );
            return;
          }

          const isAdmin = await isManager(
            client,
            interaction.user.id,
            guild.id,
            "mz"
          );

          if (interaction.user.id !== maze.userID && !isAdmin) {
            await interaction.editReply({
              content: "🚫 You do not have permission to perform this action.",
            });
            return;
          }

          const channel = await guild.channels.fetch(channelID, {
            force: true,
          });

          if (!channel || channel.type !== ChannelType.GuildText) {
            await interaction.editReply({
              content: "🚫 Invalid guild maze channel specified.",
            });
            return;
          }

          const mazeMessage = await channel.messages.fetch(embedMessageID);
          const imagesMsg = await channel.messages.fetch(messageID);

          //   delete message
          await mazeMessage.delete();
          await imagesMsg.delete();

          //   delete from db too
          await Maze.deleteOne({
            messageID: maze_id,
            serverID: guild.id,
          });

          interaction.editReply({
            content: "✅ Guild maze deleted successfully.",
          });
        } catch (err) {
          console.error("Error in delete maze subcommand callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in maze delete command : ", err);
    return undefined;
  }
};

export default init;
