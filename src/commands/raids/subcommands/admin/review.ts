// command that will review a raid, that is check on particpation list and this is where
// user schema are updated and users are given reliability score

import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  AttachmentBuilder,
  EmbedBuilder,
  GuildMember,
  User as DiscordUser,
  UserSelectMenuBuilder,
} from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Raid from "../../../../models/raidSchema";
import { leaderboardThumbnail } from "../../../../data/helperArrays";
import { calculateReliability } from "../../../../utils/raidUtils";
import User from "../../../../models/userSchema";
import { isManager } from "../../../../utils/permissionsCheck";

// so if an admin doesn't review a raid it's on them entirely
const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "review",
        description: "Review raid participation.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "raid_id",
            description: "Raid ID of raid to be reviewed",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },

      callback: async (client, interaction) => {
        try {
          const channel = interaction.channel;
          const raid_id = interaction.options.getString("raid_id");

          if (!raid_id || !channel || channel.type !== 0) {
            await interaction.editReply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
            });
            return;
          }

          //   find raid
          const raid = await Raid.findOne({
            announcementMessageID: raid_id,
          }).lean();

          if (!raid) {
            await interaction.editReply({ content: "No raid found." });
            return;
          }

          await interaction.editReply({
            content: "Raid review process started...",
          });

          const allParticipants = [
            ...raid.participants.dps,
            ...raid.participants.tank,
            ...raid.participants.support,
          ];

          const guild = await client.guilds.fetch(raid.serverID);

          // fetch all participants concurrently without letting one missing member fail the rest
          const memberResults = await Promise.allSettled(
            allParticipants.map((participant) =>
              guild.members.fetch(participant).catch(() => null)
            )
          );

          const participants: GuildMember[] = [];
          for (const result of memberResults) {
            if (result.status === "fulfilled" && result.value) {
              participants.push(result.value);
            }
          }

          const thumbnail = new AttachmentBuilder(leaderboardThumbnail).setName(
            "thumbnail.png"
          );

          const reviewEmbed = new EmbedBuilder()
            .setColor("DarkVividPink")
            .setTitle("Raid Participation Review")
            .setDescription(
              "List of all the people who particpated and those who didn't show up. not showing up after partiicpation may lead to a low reliabilit score (needed to gain Giveaway ranks)"
            )
            .addFields(
              { name: "\u200b", value: "**Attendees : **", inline: true },
              { name: "\u200b", value: "**Absentees : **", inline: true }
            )
            .setThumbnail("attachment://thumbnail.png")
            .setTimestamp();

          const attendanceMenus = [
            new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
              new UserSelectMenuBuilder()
                .setCustomId("present")
                .setPlaceholder("Mark present")
                .setMaxValues(25)
                .setMinValues(0)
            ),
            new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
              new UserSelectMenuBuilder()
                .setCustomId("absent")
                .setPlaceholder("Mark absent")
                .setMaxValues(25)
                .setMinValues(0)
            ),
          ];

          const starterMessage = [
            "📌 **Raid Review Instructions**",
            "",
            "**Steps to Review Participation**",
            "1. **Mark Attendees** – use the `Present` select menu to choose members who **attended**.",
            "2. **Mark Absentees** – use the `Absent` select menu to choose members who **did not show up**.",
            "3. **Finish** – run `!review finish` **only** when you’re sure the review is complete. This will **delete the thread**.",
            "",
            "**Important Notes**",
            "• Only members with **Raid Management** roles can interact in this thread.",
            "• Reliability scores are updated from your selections and affect giveaway eligibility.",
          ].join("\n");

          const reviewThread = await channel.threads.create({
            name: "Raid review",
            autoArchiveDuration: 60 * 24,
          });

          await reviewThread.send({ content: starterMessage });

          const attendanceMsg = await reviewThread.send({
            embeds: [reviewEmbed],
            files: [thumbnail],
            components: [...attendanceMenus],
          });

          const compCollector = attendanceMsg.createMessageComponentCollector({
            filter: (i) =>
              !i.user.bot && ["present", "absent"].includes(i.customId),
            time: 0,
          });

          let presentIDs = new Set<string>();
          let absentIDs = new Set<string>();

          compCollector.on("collect", async (i) => {
            try {
              if (!i.isUserSelectMenu()) return;
              await i.deferReply({ flags: "Ephemeral" });

              if (!(await isManager(client, i.user.id, guild.id, "raid"))) {
                await i.editReply({
                  content: "You do not have the required permissions.",
                });
                return;
              }

              if (i.customId === "present") {
                presentIDs = new Set(i.values);
                for (const id of i.values) absentIDs.delete(id);
                await i.editReply({ content: "Users marked present." });
              }

              if (i.customId === "absent") {
                absentIDs = new Set(i.values);
                for (const id of i.values) presentIDs.delete(id);
                await i.editReply({ content: "Users marked absent." });
              }

              const fetchUserSafely = async (id: string) => {
                const cached = client.users.cache.get(id);
                if (cached) return cached;
                return client.users.fetch(id).catch(() => null);
              };

              const [presentUsers, absentUsers] = await Promise.all([
                Promise.all([...presentIDs].map((id) => fetchUserSafely(id))),
                Promise.all([...absentIDs].map((id) => fetchUserSafely(id))),
              ]);

              const present = presentUsers.filter(
                (u): u is DiscordUser => u !== null
              );
              const absent = absentUsers.filter(
                (u): u is DiscordUser => u !== null
              );

              // Update attendee and absentee reliability concurrently
              const updatePresentTasks = present.map(async (user) => {
                const updatedUser = await User.findOneAndUpdate(
                  { userID: user.id },
                  {
                    $addToSet: { "raids.completed": raid._id },
                    $pull: { "raids.noShows": raid._id },
                  },
                  { new: true }
                );

                if (updatedUser) {
                  updatedUser.raids.reliability = calculateReliability(
                    updatedUser.raids.completed.length,
                    updatedUser.raids.noShows.length
                  );
                  await updatedUser.save();
                }
              });

              const updateAbsentTasks = absent.map(async (user) => {
                const updatedUser = await User.findOneAndUpdate(
                  { userID: user.id },
                  {
                    $addToSet: { "raids.noShows": raid._id },
                    $pull: { "raids.completed": raid._id },
                  },
                  { new: true }
                );

                if (updatedUser) {
                  updatedUser.raids.reliability = calculateReliability(
                    updatedUser.raids.completed.length,
                    updatedUser.raids.noShows.length
                  );
                  await updatedUser.save();
                }
              });

              await Promise.all([...updatePresentTasks, ...updateAbsentTasks]);

              reviewEmbed.setFields(
                {
                  name: "\u200b",
                  value: `**Present : **\n${
                    present.map((m) => m.displayName).join("\n") || "None"
                  }`,
                  inline: true,
                },
                {
                  name: "\u200b",
                  value: `**Absent : **\n${
                    absent.map((m) => m.displayName).join("\n") || "None"
                  }`,
                  inline: true,
                }
              );

              await attendanceMsg.edit({ embeds: [reviewEmbed] });
            } catch (err) {
              console.error("Error in compCollector collect event : ", err);
            }
          });

          const msgCollector = reviewThread.createMessageCollector({
            filter: (msg) => !msg.author.bot,
            time: 0,
          });

          msgCollector.on("collect", async (msg) => {
            try {
              if (!(await isManager(client, msg.author.id, guild.id, "raid"))) {
                await reviewThread.send({
                  content: "You do not have permission to chat...",
                });
                return;
              }

              if (msg.content === "!review finish") {
                await reviewThread.send({
                  content: "Please wait while we process your request.",
                });

                // update raid in db
                await Raid.findOneAndUpdate(
                  {
                    serverID: guild.id,
                    announcementMessageID: raid.announcementMessageID,
                  },
                  {
                    $set: {
                      stage: "finished",
                      "raidTimestamps.reviewTime": Date.now(),
                    },
                  }
                );

                await reviewThread.delete();
              }
            } catch (err) {
              console.error("Error in review thread message collector : ", err);
            }
          });
        } catch (err) {
          console.error("Error in raid review subcommand callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in raid review subcommand : ", err);
    return undefined;
  }
};

export default init;
