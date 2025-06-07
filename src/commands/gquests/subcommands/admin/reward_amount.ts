import { ApplicationCommandOptionType } from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "reward-amount",
        description:
          "Sets the amount of reward guild member gets for completing one guild quest.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "amount",
            description: "amount to set (in spinas)",
            type: ApplicationCommandOptionType.Number,
            required: true,
          },
        ],
      },

      callback: async (client, interaction) => {
        try {
          const amount = interaction.options.getNumber("amount");
          const guild = interaction.guild;

          if (!amount || !guild) {
            await interaction.reply({
              content: "Invalid command",
              flags: "Ephemeral",
            });
            return;
          }

          await interaction.deferReply();

          const updatedConfig = await Config.findOneAndUpdate(
            {
              serverID: guild.id,
            },
            { $set: { "gquestConfig.rewardAmount": amount } }
          );

          if (!updatedConfig) {
            await interaction.editReply({ content: "Guild config not found." });
            return;
          }

          await interaction.editReply({
            content: `Set guild quest reward amount to ${amount}`,
          });
        } catch (err) {
          console.error("Error in gquest reward-amount callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in gquest reward-amount subcommand : ", err);
    return undefined;
  }
};

export default init;
