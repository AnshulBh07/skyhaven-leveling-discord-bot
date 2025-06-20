import {
  ApplicationCommandOptionType,
  ChannelType,
  PermissionFlagsBits,
  PermissionResolvable,
} from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "listen-channel",
        description:
          "Remove a channel from the ignored list so the bot listens there",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "channel to listen",
            type: ApplicationCommandOptionType.Channel,
            channel_types: [ChannelType.GuildText],
          },
        ],
      },

      callback: async (client, interaction) => {
        try {
          const ans_channel = interaction.options.getChannel("channel");
          const guild_id = interaction.guildId;

          if (!guild_id || !ans_channel) {
            await interaction.reply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
              flags: "Ephemeral",
            });
            return;
          }

          await interaction.deferReply({ flags: "Ephemeral" });

          const guildConfig = await Config.findOne({ serverID: guild_id });

          if (!guildConfig) {
            await interaction.editReply(
              "🔍 This server could not be identified. Check if the bot has access."
            );
            return;
          }

          let ignoredChannels = guildConfig.levelConfig.ignoredChannels;

          if (!ignoredChannels.includes(ans_channel.id)) {
            await interaction.editReply(
              "👂 The bot is already listening to this channel."
            );
            return;
          }

          ignoredChannels = ignoredChannels.filter(
            (channel) => channel !== ans_channel.id
          );
          guildConfig.levelConfig.ignoredChannels = ignoredChannels;
          await guildConfig.save();

          await interaction.editReply(
            `Removed <#${ans_channel.id}> from ignore list.`
          );
        } catch (err) {
          console.error(
            "Error in lvl listen-channel subcommand callback : ",
            err
          );
        }
      },
    };
  } catch (err) {
    console.error("Error in lvl listen-channel subcommand callback : ", err);
    return undefined;
  }
};

export default init;
