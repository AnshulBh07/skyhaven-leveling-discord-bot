import { ApplicationCommandOptionType, ChannelType } from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "notif-channel",
        description: "Set the notification channel for level-up messages",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "channel to set for notifications",
            type: ApplicationCommandOptionType.Channel,
            channel_types: [ChannelType.GuildText],
          },
        ],
      },

      callback: async (client, interaction) => {
        await interaction.deferReply();
        const guild_id = interaction.guildId;

        const ans_channel = interaction.options.getChannel("channel");
        if (!ans_channel) return;

        // first check if the channel is text based or not
        if (ans_channel.type !== 0) {
          await interaction.editReply(
            "Selected channel is not a test based channel."
          );
          return;
        }

        // channel shouldn't be in blacklisted channels
        const guildConfig = await Config.findOne({ serverID: guild_id });

        if (!guildConfig) {
          await interaction.editReply({
            content: "Something went wrong.",
          });
          return;
        }

        // fetch guild from db and update it there
        guildConfig.levelConfig.notificationChannelID = ans_channel.id;
        await guildConfig.save();

        await interaction.editReply({
          content: `Set channel <#${ans_channel.id}> as notification channel.`,
        });
      },
    };
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

export default init;
