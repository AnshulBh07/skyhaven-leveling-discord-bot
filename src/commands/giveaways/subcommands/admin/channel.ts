import { ApplicationCommandOptionType, ChannelType } from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "channel",
        description: "Sets channel for giveaways.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "target channel",
            type: ApplicationCommandOptionType.Channel,
            channel_types: [ChannelType.GuildText],
            required: true,
          },
        ],
      },

      callback: async (client, interaction) => {
        try {
          const channel = interaction.options.getChannel("channel");
          const guildID = interaction.guildId;

          if (!channel || channel.type !== 0 || !guildID) {
            await interaction.reply({
              content: `⚠️ Invalid command. Please check your input and try again.`,
            });
            return;
          }

          await interaction.deferReply();

          const guildConfig = await Config.findOne({ serverID: guildID });

          if (!guildConfig) {
            await interaction.editReply({
              content:
                "🔍 This server could not be identified. Check if the bot has access.",
            });
            return;
          }

          guildConfig.giveawayConfig.giveawayChannelID = channel.id;
          await guildConfig.save();

          await interaction.editReply({
            content: `📢 Giveaway channel updated to: ${channel}`,
          });
        } catch (err) {
          console.error("Error in giveaway channel callback", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in giveaway channel command", err);
    return undefined;
  }
};

export default init;
