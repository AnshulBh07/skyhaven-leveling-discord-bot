import { ApplicationCommandOptionType, ChannelType } from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "use-role",
        description:
          "Sets role that enables guild members to use Giveaways related commands.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "role",
            description: "role to set",
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
        ],
      },

      callback: async (client, interaction) => {
        try {
          const role = interaction.options.getRole("role");
          const guild = interaction.guild;

          if (!role || !guild) {
            await interaction.reply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
            });
            return;
          }

          await interaction.deferReply();

          const updatedConfig = await Config.findOneAndUpdate(
            {
              serverID: guild.id,
            },
            { $set: { "giveawayConfig.giveawayRole": role.id } }
          );

          if (!updatedConfig) {
            await interaction.editReply(
              "🔍 This server could not be identified. Check if the bot has access."
            );
            return;
          }

          await interaction.editReply({
            content: `✅ Guild Giveaways user role set to <@&${role.id}>.`,
          });
        } catch (err) {
          console.error("Error in giveaway use role callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in giveaway use role subcommand : ", err);
    return undefined;
  }
};

export default init;
