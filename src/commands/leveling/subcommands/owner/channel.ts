import { ApplicationCommandOptionType, ChannelType } from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "channel",
        description:
          "Set the channel for level-up messages and related commands",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "channel to set",
            type: ApplicationCommandOptionType.Channel,
            channel_types: [ChannelType.GuildText],
          },
        ],
      },

      callback: async (client, interaction) => {
        try {
          const guild_id = interaction.guildId;

          const ans_channel = interaction.options.getChannel("channel");

          if (!guild_id || !ans_channel) {
            await interaction.reply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
              flags: "Ephemeral",
            });
            return;
          }

          await interaction.deferReply({ flags: "Ephemeral" });

          // channel shouldn't be in blacklisted channels
          const guildConfig = await Config.findOne({ serverID: guild_id });

          if (!guildConfig) {
            await interaction.editReply(
              "🔍 This server could not be identified. Check if the bot has access."
            );
            return;
          }

          const { blacklistedChannels } = guildConfig.levelConfig;

          if (blacklistedChannels.includes(ans_channel.id)) {
            await interaction.editReply({
              content: "🔒 Access to this channel is restricted.",
            });
          }

          // fetch guild from db and update it there
          guildConfig.levelConfig.notificationChannelID = ans_channel.id;
          await guildConfig.save();

          await interaction.editReply({
            content: `Set channel <#${ans_channel.id}> as notification channel.`,
          });
        } catch (err) {
          console.error("Error in lvl channel subcommand callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in lvl channel subcommand  : ", err);
    return undefined;
  }
};

export default init;
