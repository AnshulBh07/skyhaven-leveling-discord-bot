import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Raid from "../../../../models/raidSchema";
import Config from "../../../../models/configSchema";
import { getRelativeDiscordTime } from "../../../../utils/raidUtils";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const daysMapped = days.map((day, idx) => ({ name: day, value: idx }));

const daysOption = {
  name: "day",
  description: "Day of the week.",
  type: ApplicationCommandOptionType.Number as number,
  required: false,
  choices: daysMapped,
};

const timeOption = {
  name: "time",
  description: "Time of the day. (eg. 20:30, in JST)",
  type: ApplicationCommandOptionType.String as number,
  required: false,
};

// postpone a raid, there are no restrictions here assuming admins follow a proper flow
const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "postpone",
        description: "Postpone a raid.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "raid_id",
            description:
              "ID of raid to be postponed. (Cannot postpone completed raids)",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          daysOption,
          timeOption,
        ],
      },

      callback: async (client, interaction) => {
        try {
          const guild = interaction.guild;
          const raid_id = interaction.options.getString("raid_id");
          const day = interaction.options.getNumber("day");
          const time = interaction.options.getString("time");
          const channel = interaction.channel;

          if (
            !guild ||
            !raid_id ||
            !day ||
            !time ||
            !channel ||
            channel.type !== 0
          ) {
            await interaction.reply({
              content: "Invalid command.",
              flags: "Ephemeral",
            });
            return;
          }

          await interaction.deferReply({ flags: "Ephemeral" });

          const guildConfig = await Config.findOne({ serverID: guild.id });

          if (!guildConfig) {
            await interaction.editReply({ content: "Guild not found." });
            return;
          }

          const raid = await Raid.findOne({
            serverID: guild.id,
            announcementMessageID: raid_id,
          });

          if (!raid) {
            await interaction.editReply({ content: "No raid found." });
            return;
          }

          if (raid.raidTimestamps?.completedTime) {
            await interaction.editReply({
              content:
                "Cannot postpone a raid that has been completed already.",
            });
            return;
          }

          //   check if the new time is valid
          const newStartTime = getRelativeDiscordTime(day + 1, time);

          if (
            raid.raidTimestamps &&
            raid.raidTimestamps.startTime > newStartTime * 1000
          ) {
            await interaction.editReply({
              content: "Invalid time. Please provide a valid input.",
            });
            return;
          }

          const { raidChannelID, raidRole } = guildConfig.raidConfig;

          const link = `https://discord.com/channels/${guild.id}/${raidChannelID}/${raid.announcementMessageID}`;

          const LinkButton =
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel("Jump to Raid.")
                .setURL(link)
            );

          await channel.send({
            content: `<@&${raidRole}>\n The follwoing raid has been postponed to <t:${newStartTime}:F>`,
            components: [LinkButton],
          });

          //   also save in db
          if (raid.raidTimestamps) {
            raid.raidTimestamps.startTime = newStartTime * 1000;
            await raid.save();
          }

          await interaction.editReply({
            content: "Raid postponed succesfully.",
          });
        } catch (err) {
          console.error("Error in raid postpone subcommand callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in raid postpone subcommand : ", err);
    return undefined;
  }
};

export default init;
