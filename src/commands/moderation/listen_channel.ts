import {
  ApplicationCommandOptionType,
  ChannelType,
  PermissionFlagsBits,
  PermissionResolvable,
} from "discord.js";
import { ICommandObj } from "../../utils/interfaces";
import Config from "../../models/configSchema";

const commandObj: ICommandObj = {
  name: "listen-channel",
  description:
    "Remove a channel from the ignored list so the bot listens there",
  options: [
    {
      name: "channel",
      description: "channel to listen",
      type: ApplicationCommandOptionType.Channel,
      channel_types: [ChannelType.GuildText],
    },
  ],
  permissionsRequired: [
    PermissionFlagsBits.ManageGuild as PermissionResolvable,
  ],

  callback: async (client, interaction) => {
    // get the channel from options
    const ans_channel = interaction.options.getChannel("channel");
    const guild_id = interaction.guildId;

    const guild = await Config.findOne({ serverID: guild_id });

    if (!guild || !ans_channel) {
      interaction.editReply("Bot error.");
      return;
    }

    const ignoredChannels = guild.ignoredChannels;

    if (!ignoredChannels.includes(ans_channel.id)) {
      interaction.editReply("The bot is already listening to this channel");
      return;
    }

    await Config.findOneAndUpdate(
      { serverID: guild_id },
      { $pull: { ignoredChannels: ans_channel.id } }
    );

    interaction.editReply(`Removed <#${ans_channel.id}> from ignore list.`);
  },
};

export default commandObj;
