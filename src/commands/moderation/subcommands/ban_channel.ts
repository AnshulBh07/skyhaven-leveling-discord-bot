import { ApplicationCommandOptionType, ChannelType } from "discord.js";
import { ISubcommand } from "../../../utils/interfaces";
import Config from "../../../models/configSchema";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "ban-channel",
        description: "Channel where ban alerts are sent",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "channel to set",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },

      callback: async (client, interaction) => {
        try {
          const channel = interaction.options.getChannel("channel");
          const guild = interaction.guild;

          if (!channel || !guild) {
            await interaction.editReply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
            });
            return;
          }

          const updatedConfig = await Config.findOneAndUpdate(
            {
              serverID: guild.id,
            },
            { $set: { "moderationConfig.banChannelID": channel.id } }
          );

          if (!updatedConfig) {
            await interaction.editReply(
              "🔍 This server could not be identified. Check if the bot has access."
            );
            return;
          }

          await interaction.editReply({
            content: `✅ Ban alerts channel has been successfully set to <#${channel.id}>.`,
          });
        } catch (err) {
          console.error("Error in ban channel callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in ban channel subcommand : ", err);
    return undefined;
  }
};

export default init;
