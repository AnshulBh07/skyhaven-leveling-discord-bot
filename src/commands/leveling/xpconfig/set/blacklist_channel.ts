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
        await interaction.deferReply();
        // get the channel from options
        const ans_channel = interaction.options.getChannel("channel");
        const guild_id = interaction.guildId;

        const guildConfig = await Config.findOne({ serverID: guild_id });

        if (!guildConfig || !ans_channel) {
          await interaction.editReply("Bot error.");
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

        await interaction.editReply(`Added <#${ans_channel.id}> to blacklist.`);
      },
    };
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

export default init;
