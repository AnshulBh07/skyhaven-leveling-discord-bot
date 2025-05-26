import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  PermissionResolvable,
} from "discord.js";
import { ICommandObj } from "../../../utils/interfaces";
import UserStats from "../../../models/userSchema";

const init = async (): Promise<ICommandObj | undefined> => {
  try {
    return {
      name: "setxp",
      description: "Set a user's XP to a specific amount",
      options: [
        {
          name: "user",
          description: "target user to set",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: "amount",
          description: "amount to set",
          type: ApplicationCommandOptionType.Number,
          required: true,
        },
      ],
      permissionsRequired: [
        PermissionFlagsBits.ManageGuild as PermissionResolvable,
      ],

      callback: async (client, interaction) => {
        try {
          const targetUser = interaction.options.getUser("user");
          const amount = interaction.options.getNumber("amount");

          if (!targetUser || !amount) return;

          const user = await UserStats.findOne({ userID: targetUser.id });

          if (!user) {
            interaction.editReply("No user found.");
            return;
          }

          user.leveling.xp = amount;
          await user.save();

          interaction.editReply(
            `XP set to ${amount} for current level of <@${user.userID}>`
          );
        } catch (err) {
          console.error(err);
        }
      },
    };
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

export default init;
