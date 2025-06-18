import { ApplicationCommandOptionType } from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "remove-role",
        description: "Revokes the `Giveaways` role for a user.",
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

          if (!guild || !targetUser) {
            await interaction.reply({
              content: `⚠️ Invalid command. Please check your input and try again.`,
              flags: "Ephemeral",
            });
            return;
          }

          await interaction.deferReply();

          //   get the role to assign
          const grole = guild.roles.cache.find(
            (role) => role.name === "Giveaways"
          );

          if (!grole) {
            await interaction.editReply({
              content: `❌ The "Giveaways" role does not exist in this server.`,
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

          if (!user_roles.includes(grole.id)) {
            await interaction.editReply({
              content: `⚠️ <@${targetUser.id}> doesn’t have the \`Giveaways\` role.`,
            });
            return;
          }

          //   assign role
          await guild_member.roles.remove(grole);

          await interaction.editReply({
            content: `✅ Revoked role <@&${grole.id}> from <@${targetUser.id}>.`,
          });
        } catch (err) {
          console.error("Error in giveaway remove-role callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in giveaway remove-role command : ", err);
    return undefined;
  }
};

export default init;
