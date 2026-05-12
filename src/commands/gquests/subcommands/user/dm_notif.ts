import { ApplicationCommandOptionType } from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import User from "../../../../models/userSchema";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "dm-notif",
        description: "Toggle guild quest related DM notifications for user",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "value",
            description: "toggle on(true) or off(false)",
            type: ApplicationCommandOptionType.Boolean,
            required: true,
          },
          {
            name: "user",
            description: "target user",
            type: ApplicationCommandOptionType.User,
            required: false,
          },
        ],
      },

      callback: async (client, interaction) => {
        try {
          const toggleVal = interaction.options.getBoolean("value");
          const guild = interaction.guild;
          const targetUser =
            interaction.options.getUser("user") ?? interaction.user;

          if (typeof toggleVal === "undefined" || !guild) {
            await interaction.editReply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
            });
            return;
          }

          //   update toggle in db
          await User.findOneAndUpdate(
            { userID: targetUser.id },
            { $set: { "gquests.dmNotif": toggleVal } }
          );

          await interaction.editReply({
            content: `📢 Notifications setting updated for user <@${targetUser.id}>`,
          });
        } catch (err) {
          console.error("Error in dm-notif callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in dm-notif subcommand : ", err);
    return undefined;
  }
};

export default init;
