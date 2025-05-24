import {
  ApplicationCommandOptionType,
  ChannelType,
  PermissionFlagsBits,
  PermissionResolvable,
} from "discord.js";
import { ICommandObj } from "../../utils/interfaces";
import Config from "../../models/configSchema";

const commandObj: ICommandObj = {
  name: "whitelist-channel",
  description: "Removes a channel from blacklist to allow interactions",
  options: [
    {
      name: "channel",
      description: "channel to unblock",
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

    if (!blacklistedChannels.includes(ans_channel.id)) {
      interaction.editReply("Channel is not blacklisted.");
      return;
    }

    await Config.findOneAndUpdate(
      { serverID: guild_id },
      { $pull: { blacklistedChannels: ans_channel.id } }
    );

    interaction.editReply(`Removed <#${ans_channel.id}> from blacklist.`);
  },
};

export default commandObj;
