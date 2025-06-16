import { ApplicationCommandOptionType } from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "support-emoji",
        description: "Set support role emoji for guild raids.",
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
            await interaction.reply({ content: "Invalid command." });
            return;
          }

          //   check if emoji is present in guild or not
          const emoji = await guild.emojis.fetch(emoji_id);

          if (!emoji) {
            await interaction.reply({
              content:
                "Emoji not found in the server. Please select a different emoji.",
            });
            return;
          }

          await interaction.deferReply();

          const guildConfig = await Config.findOne({ serverID: guild.id });

          if (!guildConfig) {
            await interaction.editReply({
              content: "Cannot find guild config.",
            });
            return;
          }

          const { raidConfig } = guildConfig;
          raidConfig.supportEmojiID = emoji.id;
          await guildConfig.save();

          await interaction.editReply({
            content: `Set ${emoji} as support emoji for guild raids.`,
          });
        } catch (err) {
          console.error(
            "Error in raid support emoji subcommand callback : ",
            err
          );
        }
      },
    };
  } catch (err) {
    console.error("Error in raid support emoji subcommand : ", err);
    return undefined;
  }
};

export default init;
