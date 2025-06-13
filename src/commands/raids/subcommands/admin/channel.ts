import { ApplicationCommandOptionType, ChannelType } from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "channel",
        description:
          "Channel where guild raid announcements are made.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "channel to set",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },

      callback: async (client, interaction) => {
        try {
          const channel = interaction.options.getChannel("channel");
          const guild = interaction.guild;

          if (!channel || !guild) {
            await interaction.reply({
              content: "Invalid command",
              flags: "Ephemeral",
            });
            return;
          }

          await interaction.deferReply();

          const updatedConfig = await Config.findOneAndUpdate(
            {
              serverID: guild.id,
            },
            { $set: { "raidConfig.mazeChannelID": channel.id } }
          );

          if (!updatedConfig) {
            await interaction.editReply({ content: "Guild config not found." });
            return;
          }

          await interaction.editReply({
            content: `Guild raid channel set to <#${channel.id}>`,
          });
        } catch (err) {
          console.error("Error in raid channel callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in raid channel subcommand : ", err);
    return undefined;
  }
};

export default init;
