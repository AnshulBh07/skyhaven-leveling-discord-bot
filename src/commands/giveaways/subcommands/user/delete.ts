import { ApplicationCommandOptionType, ChannelType } from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Giveaway from "../../../../models/giveawaySchema";
import Config from "../../../../models/configSchema";
import { isManager } from "../../../../utils/permissionsCheck";

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
            await interaction.editReply({
              content: `⚠️ Invalid command. Please check your input and try again.`,
            });
            return;
          }

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

          const guildConfig = await Config.findOne({ serverID: guildID });

          if (!guildConfig) {
            await interaction.editReply(
              "🔍 This server could not be identified. Check if the bot has access."
            );
            return;
          }

          const isAdmin = await isManager(
            client,
            interaction.user.id,
            guildID,
            "ga"
          );

          if (interaction.user.id !== giveaway.hostID && !isAdmin) {
            await interaction.editReply({
              content: "🚫 You do not have permission to perform this action.",
            });
            return;
          }

          const guild = await client.guilds.fetch({
            guild: serverID,
            force: true,
          });

          const channel = await guild.channels.fetch(channelID, {
            force: true,
          });

          if (!channel || channel.type !== ChannelType.GuildText) {
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
