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
        await interaction.deferReply();
        // get the channel from options
        const ans_channel = interaction.options.getChannel("channel");
        const guild_id = interaction.guildId;

        const guildConfig = await Config.findOne({ serverID: guild_id });

        if (!guildConfig || !ans_channel) {
          await interaction.editReply("Bot error.");
          return;
        }

        let ignoredChannels = guildConfig.levelConfig.ignoredChannels;

        if (ignoredChannels.includes(ans_channel.id)) {
          await interaction.editReply("Channel already present in ignore list.");
          return;
        }

        ignoredChannels = [...ignoredChannels, ans_channel.id];
        guildConfig.levelConfig.ignoredChannels = ignoredChannels;
        await guildConfig.save();

        await interaction.editReply(`Added <#${ans_channel.id}> to ignore list.`);
      },
    };
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

export default init;
