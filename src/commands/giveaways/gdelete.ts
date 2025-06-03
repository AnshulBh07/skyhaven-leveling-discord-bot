import { ApplicationCommandOptionType } from "discord.js";
import { ICommandObj } from "../../utils/interfaces";
import Giveaway from "../../models/giveawaySchema";

const init = async (): Promise<ICommandObj | undefined> => {
  try {
    return {
      name: "gdelete",
      description: "Deletes a giveaway based on it's ID.",
      options: [
        {
          name: "giveaway_id",
          description:
            "id of giveaway you want to delete. (Can be found on giveaway creation message.)",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
      permissionsRequired: [],

      callback: async (client, interaction) => {
        try {
          const giveaway_id = interaction.options.getString("giveaway_id");

          if (!giveaway_id) {
            await interaction.reply({
              content: "Invalid giveaway ID",
              flags: "Ephemeral",
            });
            return;
          }

          const giveaway = await Giveaway.findOne({ messageID: giveaway_id });

          if (!giveaway) {
            await interaction.reply({
              content: "Giveaway not found.",
              flags: "Ephemeral",
            });
            return;
          }

          const { messageID, serverID, channelID, isEnded } = giveaway;

          if (isEnded) {
            await interaction.reply({
              content: "You cannot delete a giveaway that has been completed.",
            });
            return;
          }

          await interaction.deferReply({ flags: "Ephemeral" });

          const guild = await client.guilds.fetch(serverID);
          const channel = await guild.channels.fetch(channelID);

          if (!channel || !channel.isTextBased()) {
            await interaction.editReply({
              content: "Invalid giveaway channel.",
            });
            return;
          }

          const giveawayMessage = await channel.messages.fetch(messageID);

          //   delete message
          await giveawayMessage.delete();

          //   delete from db too
          await Giveaway.deleteOne({ messageID: giveaway_id });

          interaction.editReply({ content: "Giveaway deleted successfully." });
        } catch (err) {
          console.error("Error in gdelete callback :", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in gdelete command", err);
    return undefined;
  }
};

export default init;
