import { ApplicationCommandOptionType } from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "dps-emoji",
        description: "Set dps role emoji for guild raids.",
        options: [
          {
            name: "emoji_id",
            description: "ID of emoji",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
        type: ApplicationCommandOptionType.Subcommand,
      },

      callback: async (client, interaction) => {
        try {
          const emoji_id = interaction.options.getString("emoji_id");
          const guild = interaction.guild;

          if (!emoji_id || !guild) {
            await interaction.editReply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
            });
            return;
          }

          //   check if emoji is present in guild or not
          const emoji = await guild.emojis.fetch(emoji_id, { force: true });

          if (!emoji) {
            await interaction.editReply({
              content:
                "Emoji not found in the server. Please select a different emoji.",
            });
            return;
          }

          const guildConfig = await Config.findOne({ serverID: guild.id });

          if (!guildConfig) {
            await interaction.editReply(
              "🔍 This server could not be identified. Check if the bot has access."
            );
            return;
          }

          const { raidConfig } = guildConfig;
          raidConfig.dpsEmojiID = emoji.id;
          await guildConfig.save();

          await interaction.editReply({
            content: `Set ${emoji} as dps emoji for guild raids.`,
          });
        } catch (err) {
          console.error("Error in raid dps emoji subcommand callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in raid dps emoji subcommand : ", err);
    return undefined;
  }
};

export default init;
