import { ApplicationCommandOptionType, ChannelType } from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "blacklist-channel",
        description: "Block all command usage in a channel",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "channel to block",
            type: ApplicationCommandOptionType.Channel,
            channel_types: [ChannelType.GuildText],
          },
        ],
      },

      callback: async (client, interaction) => {
        try {
          // get the channel from options
          const ans_channel = interaction.options.getChannel("channel");
          const guild_id = interaction.guildId;

          if (!guild_id || !ans_channel) {
            await interaction.editReply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
            });
            return;
          }

          const guildConfig = await Config.findOne({ serverID: guild_id });

          if (!guildConfig) {
            await interaction.editReply(
              "🔍 This server could not be identified. Check if the bot has access."
            );
            return;
          }

          let blacklistedChannels = guildConfig.levelConfig.blacklistedChannels;

          if (blacklistedChannels.includes(ans_channel.id)) {
            await interaction.editReply("Channel is already blacklisted.");
            return;
          }

          blacklistedChannels = [...blacklistedChannels, ans_channel.id];
          guildConfig.levelConfig.blacklistedChannels = blacklistedChannels;
          await guildConfig.save();

          await interaction.editReply(
            `Added <#${ans_channel.id}> to blacklist.`
          );
        } catch (err) {
          console.error(
            "Error in lvl blacklist-channel subcommand callback : ",
            err
          );
        }
      },
    };
  } catch (err) {
    console.error("Error in lvl blacklist-channel subcommand  : ", err);
    return undefined;
  }
};

export default init;
