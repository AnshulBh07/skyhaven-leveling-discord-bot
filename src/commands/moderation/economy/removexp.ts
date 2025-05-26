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
      name: "removexp",
      description: "Remove specified amount of XP from a user",
      options: [
        {
          name: "user",
          description: "user to target",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: "amount",
          description: "amount of xp",
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

          user.leveling.xp -= amount;
          user.leveling.totalXp -= amount;

          await user.save();
          interaction.editReply(`Added ${amount} XP to <@${targetUser.id}>`);
        } catch (err) {
          console.error(err);
          return;
        }
      },
    };
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

export default init;
