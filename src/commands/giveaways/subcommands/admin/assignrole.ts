import { ApplicationCommandOptionType, PermissionsBitField } from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import { isManager } from "../../../../utils/permissionsCheck";
import Config from "../../../../models/configSchema";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "assignrole",
        description: "Assign the `Giveaways` role to a user",
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
          const targetUser = interaction.options.getUser("user");
          const guild = interaction.guild;

          if (!guild || !targetUser || targetUser.bot) {
            await interaction.editReply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
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

          const { giveawayRole } = guildConfig.giveawayConfig;

          //   get the role to assign
          const grole = await guild.roles.fetch(giveawayRole, { force: true });

          if (!grole) {
            await interaction.editReply({
              content:
                "❌ No `Giveaways` role found in this server.\nPlease create a role named `Giveaways` before using this command.",
            });
            return;
          }

          //   check if user already has this role
          const guild_member = await guild.members.fetch({
            user: targetUser.id,
            force: true,
          });
          const user_roles = Array.from(guild_member.roles.cache.entries()).map(
            ([_, role]) => role.id
          );

          if (user_roles.includes(grole.id)) {
            await interaction.editReply({
              content: `ℹ️ <@${targetUser.id}> already has the \`Giveaways\` role.`,
            });
            return;
          }

          //   assign role
          await guild_member.roles.add(grole);

          await interaction.editReply({
            content: `✅ Successfully assigned the role <@&${grole.id}> to <@${targetUser.id}>.`,
          });
        } catch (err) {
          console.error("Error in giveaway assignrole callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in giveaway assignrole command : ", err);
    return undefined;
  }
};

export default init;
