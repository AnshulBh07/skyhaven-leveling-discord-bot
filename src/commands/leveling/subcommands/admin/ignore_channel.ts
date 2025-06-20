import { ApplicationCommandOptionType, ChannelType } from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "ignore-channel",
        description: "Prevent XP gain in specified channels",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "channel to ignore",
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

          if (ignoredChannels.includes(ans_channel.id)) {
            await interaction.editReply(
              "🚫 This channel is already in the ignore list."
            );
            return;
          }

          ignoredChannels = [...ignoredChannels, ans_channel.id];
          guildConfig.levelConfig.ignoredChannels = ignoredChannels;
          await guildConfig.save();

          await interaction.editReply(
            `Added <#${ans_channel.id}> to ignore list.`
          );
        } catch (err) {
          console.error(
            "Error in lvl ignore-channel subcommand callback : ",
            err
          );
        }
      },
    };
  } catch (err) {
    console.error("Error in lvl ignore-channel subcommand : ", err);
    return undefined;
  }
};

export default init;
