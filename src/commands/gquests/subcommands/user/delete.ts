import { ApplicationCommandOptionType, ChannelType } from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";
import GQuest from "../../../../models/guildQuestsSchema";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "delete",
        description: "Delete a created guild quest submission",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "gquest_id",
            description: "ID of gquest to be deleted.",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },

      callback: async (client, interaction) => {
        try {
          const guild = interaction.guild;
          const gquest_id = interaction.options.getString("gquest_id");

          if (!gquest_id || !guild) {
            await interaction.editReply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
            });
            return;
          }

          const gquest = await GQuest.findOne({
            serverID: guild.id,
            messageID: gquest_id,
          });

          if (!gquest) {
            await interaction.editReply({
              content:
                "🚫 Guild quest not found. Please ensure the provided ID is correct.",
            });
            return;
          }

          const { status, channelID, messageID } = gquest;

          if (status !== "pending") {
            await interaction.editReply({
              content:
                "⚠️ You cannot delete a gquest submission that has already been completed.",
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

          const { managerRoles } = guildConfig.gquestMazeConfig;

          // not everyone can delete the giveaway they should be either an admin or the person who creted giveaway himself
          const allowedIDs = [...managerRoles, gquest.userID];

          if (!allowedIDs.includes(interaction.user.id)) {
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
              content: "🚫 Invalid guild quest channel specified.",
            });
            return;
          }

          const gquestMessage = await channel.messages.fetch(messageID);

          //   delete message
          await gquestMessage.delete();

          //   delete from db too
          await GQuest.deleteOne({
            messageID: gquest_id,
            serverID: guild.id,
          });

          interaction.editReply({
            content: "✅ Guild Quest deleted successfully.",
          });
        } catch (err) {
          console.error("Error in delete gquest subcommand callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in gquest delete command : ", err);
    return undefined;
  }
};

export default init;
