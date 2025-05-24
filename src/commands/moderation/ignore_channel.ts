import {
  ApplicationCommandOptionType,
  ChannelType,
  PermissionFlagsBits,
  PermissionResolvable,
} from "discord.js";
import { ICommandObj } from "../../utils/interfaces";
import Config from "../../models/configSchema";

const commandObj: ICommandObj = {
  name: "ignore-channel",
  description: "Prevent XP gain in specified channels",
  options: [
    {
      name: "channel",
      description: "channel to ignore",
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

    if (ignoredChannels.includes(ans_channel.id)) {
      interaction.editReply("Channel already present in ignore list.");
      return;
    }

    await Config.findOneAndUpdate(
      { serverID: guild_id },
      { $push: { ignoredChannels: ans_channel.id } }
    );

    interaction.editReply(`Added <#${ans_channel.id}> to ignore list.`);
  },
};

export default commandObj;
