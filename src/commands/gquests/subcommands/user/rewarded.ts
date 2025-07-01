import { ApplicationCommandOptionType, ChannelType } from "discord.js";
import { IGquest, ISubcommand } from "../../../../utils/interfaces";
import GQuest from "../../../../models/guildQuestsSchema";
import { generateGquestsListEmbed } from "../../../../utils/gquestUtils";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "rewarded",
        description:
          "Gives list of all rewarded guild quests. If user is specified gives details for the user only",
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

          //   fetch all rewarded gquests
          let gquests: IGquest[] = await GQuest.find({
            serverID: guild.id,
            status: "rewarded",
          });

          gquests = (gquests as IGquest[]).filter(
            (gquest) => gquest.userID === targetUser.id
          );

          const title = `📃 List of Rewarded Guild Quests for ${targetUser.username}`;

          //   create embed with buttons
          await generateGquestsListEmbed(
            client,
            interaction,
            gquests,
            title,
            targetUser.id,
            "rewarded"
          );
        } catch (err) {
          console.error("Error in gquest rewarded subcommand callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in gquest rewarded subcommand : ", err);
    return undefined;
  }
};

export default init;
