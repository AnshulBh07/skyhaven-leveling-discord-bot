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
          "Sets the amount of reward guild member gets for completing guild maze (per 100 levels)",
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
              content:
                "⚠️ Invalid command. Please check your input and try again.",
            });
            return;
          }

          await interaction.deferReply({flags:"Ephemeral"});

          const updatedConfig = await Config.findOneAndUpdate(
            {
              serverID: guild.id,
            },
            { $set: { "gquestMazeConfig.mazeRewardAmount": amount } }
          );

          if (!updatedConfig) {
            await interaction.editReply(
              "🔍 This server could not be identified. Check if the bot has access."
            );
            return;
          }

          await interaction.editReply({
            content: `💰 Set guild maze reward amount to ${amount}.`,
          });
        } catch (err) {
          console.error("Error in maze reward-amount callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in maze reward-amount subcommand : ", err);
    return undefined;
  }
};

export default init;
