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
        await interaction.deferReply()
        // get the channel from options
        const ans_channel = interaction.options.getChannel("channel");
        const guild_id = interaction.guildId;

        const guildConfig = await Config.findOne({ serverID: guild_id });

        if (!guildConfig || !ans_channel) {
          await interaction.editReply("Bot error.");
          return;
        }

        let ignoredChannels = guildConfig.levelConfig.ignoredChannels;

        if (!ignoredChannels.includes(ans_channel.id)) {
          await interaction.editReply("The bot is already listening to this channel");
          return;
        }

        ignoredChannels = ignoredChannels.filter(
          (channel) => channel !== ans_channel.id
        );
        guildConfig.levelConfig.ignoredChannels = ignoredChannels;
        await guildConfig.save();

        await interaction.editReply(`Removed <#${ans_channel.id}> from ignore list.`);
      },
    };
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

export default init;
