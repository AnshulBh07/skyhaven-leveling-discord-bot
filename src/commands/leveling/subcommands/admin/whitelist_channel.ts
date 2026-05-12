import { ApplicationCommandOptionType, ChannelType } from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "whitelist-channel",
        description: "Removes a channel from blacklist to allow interactions",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "channel to unblock",
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

          if (!blacklistedChannels.includes(ans_channel.id)) {
            await interaction.editReply("⚠️ Channel is not blacklisted.");
            return;
          }

          blacklistedChannels = blacklistedChannels.filter(
            (channel) => channel !== ans_channel.id
          );
          guildConfig.levelConfig.blacklistedChannels = blacklistedChannels;
          await guildConfig.save();

          await interaction.editReply(
            `✅ Removed <#${ans_channel.id}> from blacklist.`
          );
        } catch (err) {
          console.error(
            "Error in whitelist-channel subcommand callback : ",
            err
          );
        }
      },
    };
  } catch (err) {
    console.error("Error in whitelist-channel subcommand : ", err);
    return undefined;
  }
};

export default init;
