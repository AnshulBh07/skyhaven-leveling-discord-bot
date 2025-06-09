import { ApplicationCommandOptionType } from "discord.js";
import { ICommandObj } from "../../../utils/interfaces";

const init = async (): Promise<ICommandObj | undefined> => {
  try {
    return {
      name: "gassignrole",
      description: "Assign the `Giveaways` role to user.",
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

          if (user_roles.includes(grole.id)) {
            await interaction.editReply({
              content: `<@${targetUser.id}> already has the Giveaways role`,
            });
            return;
          }

          //   assign role
          await guild_member.roles.add(grole);

          await interaction.editReply({
            content: `Added role <@&${grole.id}> to guild member <@${targetUser.id}>`,
          });
        } catch (err) {
          console.error("Error in gassignrole callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in gassignrole command");
    return undefined;
  }
};

export default init;
