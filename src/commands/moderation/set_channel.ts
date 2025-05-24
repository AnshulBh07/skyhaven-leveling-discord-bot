import {
  ApplicationCommandOptionType,
  ChannelType,
  PermissionFlagsBits,
  PermissionResolvable,
} from "discord.js";
import { ICommandObj } from "../../utils/interfaces";
import Config from "../../models/configSchema";

const commandObj: ICommandObj = {
  name: "set-channel",
  description: "Set the notification channel for level-up messages",
  options: [
    {
      name: "channel",
      description: "channel to set for notifications",
      type: ApplicationCommandOptionType.Channel,
      channel_types: [ChannelType.GuildText],
    },
  ],
  permissionsRequired: [
    PermissionFlagsBits.ManageGuild as PermissionResolvable,
  ],

  callback: async (client, interaction) => {
    const guild_id = interaction.guildId;

    const ans_channel = interaction.options.getChannel("channel");
    if (!ans_channel) return;

    // channel shouldn't be in blacklisted channels
    const guild = await Config.findOne({ serverID: guild_id });

    if (!guild) {
      interaction.editReply({
        content: "Something went wrong.",
      });
      return;
    }

    // fetch guild from db and update it there
    await Config.findOneAndUpdate(
      { serverID: guild_id },
      { notificationChannelID: ans_channel.id }
    );

    interaction.editReply({
      content: `Set channel <#${ans_channel.id}> as notification channel.`,
    });
  },
};

export default commandObj;
