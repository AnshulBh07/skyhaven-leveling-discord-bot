import { ApplicationCommandOptionType, ChannelType } from "discord.js";
import { ICommandObj } from "../../../utils/interfaces";
import Config from "../../../models/configSchema";

const init = async (): Promise<ICommandObj | undefined> => {
  try {
    return {
      name: "gchannel",
      description: "Sets channel for giveaways.",
      options: [
        {
          name: "channel",
          description: "target channel",
          type: ApplicationCommandOptionType.Channel,
          channel_types: [ChannelType.GuildText],
          required: true,
        },
      ],
      permissionsRequired: [],

      callback: async (client, interaction) => {
        try {
          const channel = interaction.options.getChannel("channel");
          const guildID = interaction.guildId;

          if (!channel || channel.type !== 0) {
            await interaction.reply({ content: `Invalid channel` });
            return;
          }

          const guildConfig = await Config.findOne({ serverID: guildID });

          if (!guildConfig) {
            await interaction.reply({
              content: "No server found.",
              flags: "Ephemeral",
            });
            return;
          }

          guildConfig.giveawayConfig.giveawayChannelID = channel.id;
          await guildConfig.save();

          await interaction.reply({
            content: `Set channel ${channel} as giveaway channel.`,
          });
        } catch (err) {
          console.error("Error in gchannel callback", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in gchannel command", err);
    return undefined;
  }
};

export default init;
