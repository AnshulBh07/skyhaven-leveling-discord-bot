import { ApplicationCommandOptionType, ChannelType } from "discord.js";
import { IGquest, ISubcommand } from "../../../../utils/interfaces";
import GQuest from "../../../../models/guildQuestsSchema";
import { generateGquestsListEmbed } from "../../../../utils/gquestUtils";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "pending",
        description:
          "Gives list of all pending guild quests. If user is specified gives details for the user only",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
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
          const targetUser = interaction.options.getUser("user");
          const guild = interaction.guild;
          const channel = interaction.channel;

          if (!guild || !channel || channel.type !== ChannelType.GuildText) {
            await interaction.editReply({
              content: `⚠️ Invalid command. Please check your input and try again.`,
            });
            return;
          }

          //   fetch all pending gquests
          let gquests: IGquest[] = await GQuest.find({
            serverID: guild.id,
            status: "pending",
          });

          let title = "📃 List of all Pending Guild Quests";

          if (targetUser) {
            gquests = (gquests as IGquest[]).filter(
              (gquest) => gquest.userID === targetUser.id
            );
            title = `📃 List of Pending Guild Quests for ${targetUser.username}`;
          }

          //   create embed with buttons
          await generateGquestsListEmbed(
            client,
            interaction,
            gquests,
            title,
            "pending"
          );
        } catch (err) {
          console.error("Error in pending subcommand callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in gquest pending subcommand : ", err);
    return undefined;
  }
};

export default init;
