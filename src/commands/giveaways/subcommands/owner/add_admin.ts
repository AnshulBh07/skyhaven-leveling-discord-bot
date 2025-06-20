import { ApplicationCommandOptionType, ChannelType } from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "add-admin",
        description: "Adds a role that can manage giveaways on server.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "role",
            description: "management role to add",
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

          const { managerRoles } = config.giveawayConfig;

          if (managerRoles.includes(role.id)) {
            await interaction.editReply(
              "⚠️ This role is already set as a management role."
            );
            return;
          }

          config.giveawayConfig.managerRoles.push(role.id);
          await config.save();

          await interaction.editReply({
            content: `✅ Added <@&${role.id}> as a management role for giveaways.`,
          });
        } catch (err) {
          console.error("Error in giveaway add-admin callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in giveaway add-admin subcommand : ", err);
    return undefined;
  }
};

export default init;
