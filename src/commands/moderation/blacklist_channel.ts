import {
  ApplicationCommandOptionType,
  ChannelType,
  PermissionFlagsBits,
  PermissionResolvable,
} from "discord.js";
import { ICommandObj } from "../../utils/interfaces";
import Config from "../../models/configSchema";

const commandObj: ICommandObj = {
  name: "blacklist-channel",
  description: "Block all command usage in a channel",
  options: [
    {
      name: "channel",
      description: "channel to block",
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

    const blacklistedChannels = guild.blacklistedChannels;

    if (blacklistedChannels.includes(ans_channel.id)) {
      interaction.editReply("Channel is already blacklisted.");
      return;
    }

    await Config.findOneAndUpdate(
      { serverID: guild_id },
      { $push: { blacklistedChannels: ans_channel.id } }
    );

    interaction.editReply(`Added <#${ans_channel.id}> to blacklist.`);
  },
};

export default commandObj;
