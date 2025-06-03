import { AttachmentBuilder, EmbedBuilder } from "discord.js";
import Giveaway from "../../models/giveawaySchema";
import { ICommandObj } from "../../utils/interfaces";
import { leaderboardThumbnail } from "../../data/helperArrays";

const init = async (): Promise<ICommandObj | undefined> => {
  try {
    return {
      name: "glist",
      description:
        "Displays a list of all active giveaways for current server.",
      options: [],
      permissionsRequired: [],

      callback: async (client, interaction) => {
        try {
          const guildID = interaction.guildId;

          if (!guildID) {
            await interaction.reply({
              content: "Invalid guild",
              flags: "Ephemeral",
            });
            return;
          }

          await interaction.deferReply({ flags: "Ephemeral" });

          const guild = await client.guilds.fetch(guildID);

          const thumbnail = new AttachmentBuilder(leaderboardThumbnail).setName(
            "thumbnail.png"
          );

          //   get all the giveaways for current server
          const giveaways = await Giveaway.find({
            serverID: guildID,
            isEnded: false,
          });

          const embed = new EmbedBuilder()
            .setTitle("🎁 List of Active Giveaways")
            .setColor("Gold")
            .setThumbnail("attachment://thumbnail.png")
            .setDescription(
              giveaways.length > 0
                ? giveaways
                    .map(
                      (g, i) =>
                        `**${i + 1}. [${g.prize}]**\n- 🪪 Giveaway ID : ${
                          g.messageID
                        }\n- 👤 Hosted by : <@${g.hostID}>\n- 🎉 Winners : **${
                          g.winnersCount
                        }**\n- ⏳ Ends : <t:${Math.floor(g.endsAt / 1000)}:R>`
                    )
                    .join("\n\n")
                : "*No active giveaways right now. Check back later!*"
            )
            .setFooter({
              text: `${guild.name} Giveaways`,
            })
            .setTimestamp();

          await interaction.editReply({ embeds: [embed], files: [thumbnail] });
        } catch (err) {
          console.error("Error in glist callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in glist command :", err);
    return undefined;
  }
};

export default init;
