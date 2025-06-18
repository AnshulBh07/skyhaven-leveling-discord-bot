import { ApplicationCommandOptionType } from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Giveaway from "../../../../models/giveawaySchema";
import { isUser } from "../../../../utils/permissionsCheck";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "delete",
        description: "Deletes a giveaway based on it's ID.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "giveaway_id",
            description:
              "id of giveaway you want to delete. (Can be found on giveaway creation message)",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },

      callback: async (client, interaction) => {
        try {
          const giveaway_id = interaction.options.getString("giveaway_id");
          const guildID = interaction.guildId;

          if (!giveaway_id || !guildID) {
            await interaction.reply({
              content: `⚠️ Invalid command. Please check your input and try again.`,
            });
            return;
          }

          await interaction.deferReply();

          const giveaway = await Giveaway.findOne({
            serverID: guildID,
            messageID: giveaway_id,
          });

          if (!giveaway) {
            await interaction.editReply({
              content:
                "🚫 Giveaway not found. Please ensure the provided ID is correct.",
            });
            return;
          }

          const { messageID, serverID, channelID, isEnded } = giveaway;

          if (isEnded) {
            await interaction.editReply({
              content:
                "⚠️ You cannot delete a giveaway that has already been completed.",
            });
            return;
          }

          const guild = await client.guilds.fetch(serverID);
          const channel = await guild.channels.fetch(channelID);

          if (!channel || !channel.isTextBased()) {
            await interaction.editReply({
              content: "🚫 Invalid giveaway channel specified.",
            });
            return;
          }

          const giveawayMessage = await channel.messages.fetch(messageID);

          //   delete message
          await giveawayMessage.delete();

          //   delete from db too
          await Giveaway.deleteOne({
            messageID: giveaway_id,
            serverID: guildID,
          });

          interaction.editReply({
            content: "✅ Giveaway deleted successfully.",
          });
        } catch (err) {
          console.error("Error in giveaway delete callback :", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in giveaway delete command", err);
    return undefined;
  }
};

export default init;
