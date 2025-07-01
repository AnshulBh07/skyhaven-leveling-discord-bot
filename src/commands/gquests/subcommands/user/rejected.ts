import { ApplicationCommandOptionType, ChannelType } from "discord.js";
import { IGquest, ISubcommand } from "../../../../utils/interfaces";
import GQuest from "../../../../models/guildQuestsSchema";
import { generateGquestsListEmbed } from "../../../../utils/gquestUtils";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "rejected",
        description:
          "Gives list of all rejected guild quests. If user is specified gives details for the user only",
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
          const targetUser =
            interaction.options.getUser("user") ?? interaction.user;
          const guild = interaction.guild;
          const channel = interaction.channel;

          if (!guild || !channel || channel.type !== ChannelType.GuildText) {
            await interaction.editReply({
              content: `⚠️ Invalid command. Please check your input and try again.`,
            });
            return;
          }

          //   fetch all rejected gquests
          let gquests: IGquest[] = await GQuest.find({
            serverID: guild.id,
            status: "rejected",
          });

          gquests = (gquests as IGquest[]).filter(
            (gquest) => gquest.userID === targetUser.id
          );

          const title = `📃 List of Rejected Guild Quests for ${targetUser.username}`;

          //   create embed with buttons
          await generateGquestsListEmbed(
            client,
            interaction,
            gquests,
            title,
            targetUser.id,
            "rejected"
          );
        } catch (err) {
          console.error("Error in gquest rejected subcommand callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in gquest rejected subcommand : ", err);
    return undefined;
  }
};

export default init;
