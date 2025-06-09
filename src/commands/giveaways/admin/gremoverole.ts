import { ApplicationCommandOptionType } from "discord.js";
import { ICommandObj } from "../../../utils/interfaces";

const init = async (): Promise<ICommandObj | undefined> => {
  try {
    return {
      name: "gremoverole",
      description: "Revokes the `Giveaways` role for user.",
      options: [
        {
          name: "user",
          description: "target user",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
      ],
      permissionsRequired: [],

      callback: async (client, interaction) => {
        try {
          const targetUser = interaction.options.getUser("user");
          const guild = interaction.guild;

          if (!guild || !targetUser) {
            await interaction.reply({
              content: "Invalid command.",
              flags: "Ephemeral",
            });
            return;
          }

          //   get the role to assign
          const grole = guild.roles.cache.find(
            (role) => role.name === "Giveaways"
          );

          if (!grole) {
            await interaction.reply({
              content: "No Giveaways role present in the server",
              flags: "Ephemeral",
            });
            return;
          }

          await interaction.deferReply({ flags: "Ephemeral" });

          //   check if user already has this role
          const guild_member = await guild.members.fetch(targetUser.id);
          const user_roles = Array.from(guild_member.roles.cache.entries()).map(
            ([_, role]) => role.id
          );

          if (!user_roles.includes(grole.id)) {
            await interaction.editReply({
              content: `<@${targetUser.id}> doesn't have Giveawas role`,
            });
            return;
          }

          //   assign role
          await guild_member.roles.remove(grole);

          await interaction.editReply({
            content: `Revoked role <@&${grole.id}> for guild member <@${targetUser.id}>`,
          });
        } catch (err) {
          console.error("Error in gremoverole callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in gremoverole command");
    return undefined;
  }
};

export default init;
