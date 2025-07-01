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
          "Sets the amount of reward guild member gets for completing one guild quest",
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
            await interaction.editReply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
            });
            return;
          }

          const updatedConfig = await Config.findOneAndUpdate(
            {
              serverID: guild.id,
            },
            { $set: { "gquestMazeConfig.gquestRewardAmount": amount } }
          );

          if (!updatedConfig) {
            await interaction.editReply(
              "🔍 This server could not be identified. Check if the bot has access."
            );
            return;
          }

          await interaction.editReply({
            content: `💰 Set guild quest reward amount to ${amount.toLocaleString(
              "en-US"
            )} spina.`,
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
