import { ApplicationCommandOptionType, ChannelType } from "discord.js";
import { ISubcommand } from "../../../utils/interfaces";
import Config from "../../../models/configSchema";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "remove-admin",
        description: "Revoke a user from bot management.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "target user",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },

      callback: async (client, interaction) => {
        try {
          const user = interaction.options.getUser("user");
          const guild = interaction.guild;

          if (!user || !guild) {
            await interaction.editReply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
            });
            return;
          }

          const config = await Config.findOne({ serverID: guild.id });

          if (!config) {
            await interaction.editReply(
              "🔍 This server could not be identified. Check if the bot has access."
            );
            return;
          }

          const { botAdminIDs } = config.moderationConfig;

          if (!botAdminIDs.includes(user.id)) {
            await interaction.editReply(
              "⚠️ This user is not set as bot admin."
            );
            return;
          }

          config.moderationConfig.botAdminIDs =
            config.moderationConfig.botAdminIDs.filter(
              (admin) => admin !== user.id
            );
          await config.save();

          await interaction.editReply({
            content: `✅ Revoked <@${user.id}> as an admin for bot.`,
          });
        } catch (err) {
          console.error("Error in mod remove-admin callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in mod remove-admin subcommand : ", err);
    return undefined;
  }
};

export default init;
