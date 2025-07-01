import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Client,
  DiscordAPIError,
  EmbedBuilder,
  TextThreadChannel,
} from "discord.js";
import Maze from "../models/mazeSchema";
import User from "../models/userSchema";
import { leaderboardThumbnail } from "../data/helperArrays";
import { attachQuestMazeReviewCollector } from "./gquestUtils";
import { IMaze } from "./interfaces";

const thumbnail = new AttachmentBuilder(leaderboardThumbnail).setName(
  "thumbnail.png"
);

export const attachMazeThreadCollector = async (
  client: Client,
  threadID: string
) => {
  try {
    // first we find the thread
    const maze = await Maze.findOne({ submissionThreadID: threadID });

    if (!maze) return;

    const guild = await client.guilds.fetch(maze.serverID);
    const channel = await guild.channels.fetch(maze.channelID, { force: true });

    if (!channel || channel.type !== ChannelType.GuildText) return;

    let submissionThread: TextThreadChannel | null = null;

    try {
      submissionThread = await channel.threads.fetch(maze.submissionThreadID);
    } catch (err) {
      if ((err as DiscordAPIError).code === 10003) {
        console.warn(
          `Thread ${maze.submissionThreadID} was deleted or not found. Skipping collector attachment.`
        );
        return;
      } else {
        throw err;
      }
    }

    if (!submissionThread) return;

    let submissionsRequired = Math.round(
      (maze.endFloor - maze.startFloor) / 100
    );

    // we will use a message collector not a component interaction collector
    // as user will send images as message attachments
    const collector = submissionThread.createMessageCollector({
      filter: (msg) => !msg.author.bot,
      time: 60_000 * 60, //60 min
    });

    collector.on("collect", async (msg) => {
      try {
        // check if the message is from same user or not
        if (msg.author.id !== maze.userID) {
          await submissionThread.send({
            content: "❌ You do not have permission to chat in this thread.",
          });

          await msg.delete();
          return;
        }

        if (msg.content.length > 0) {
          await submissionThread.send({
            content: "Please send the images only",
          });
          return;
        }

        // check if the message is valid or not
        const attachments = Array.from(msg.attachments.entries()).map(
          ([_, attachment]) => attachment
        );

        // check valid submission
        if (
          attachments.length !== submissionsRequired ||
          attachments.some(
            (attachment) =>
              attachment.contentType &&
              !attachment.contentType.startsWith("image/")
          )
        ) {
          await submissionThread.send({
            content: "Invalid submission. Please try again.",
          });
          return;
        }

        await submissionThread.send({
          content: "Please wait while we process your submission.",
        });

        // valid attachments take their url in and save in db
        const imageUrls = attachments.map((attachment) => attachment.url);

        await Maze.findOneAndUpdate(
          { submissionThreadID: threadID },
          { $set: { imageUrls: imageUrls } }
        );

        await submissionThread.send({ content: "Thanks for submissions." });

        // find user and update
        const user = await User.findOneAndUpdate(
          { userID: maze.userID },
          {
            $set: {
              "mazes.lastSubmissionDate": new Date(),
            },
            $push: { "mazes.pending": maze._id },
          }
        );

        if (!user) {
          await channel.send({ content: "No user found." });
          return;
        }

        // create a submission embed
        const submissionEmbed = new EmbedBuilder()
          .setTitle("🧾 Guild Maze Submission")
          .setDescription(
            `Thank you for your submission! 🔍\n` +
              `Our team will review it shortly. If everything checks out, you’ll be rewarded soon. 🎉`
          )
          .setColor("Aqua")
          .setThumbnail("attachment://thumbnail.png")
          .addFields(
            {
              name: "\u200b",
              value: `**📤 Submitted by : **<@${user.userID}>`,
              inline: false,
            },
            {
              name: "\u200b",
              value: `**Start Floor : **${maze.startFloor}`,
              inline: false,
            },
            {
              name: "\u200b",
              value: `**End Floor : **${maze.endFloor}`,
              inline: false,
            },
            {
              name: "\u200b",
              value: `**🕒 Submitted On : **<t:${Math.floor(
                Date.now() / 1000
              )}:F>`,
            },
            {
              name: "\u200b",
              value: `**📌 Status : **${"Pending"}`,
              inline: false,
            },
            {
              name: "👤 User Status",
              value: `**Total Pending : **${
                user.mazes.pending.length + 1
              }\n**Total Rewarded : **${user.mazes.rewarded.length}`,
              inline: false,
            }
          )
          .setFooter({ text: `${guild.name} Guild Mazes` })
          .setTimestamp();

        const buttonsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("reward")
            .setEmoji("💵")
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId("reject")
            .setEmoji("❌")
            .setStyle(ButtonStyle.Secondary)
        );

        // send message at channel
        const embedMessage = await channel.send({
          embeds: [submissionEmbed],
          files: [thumbnail],
        });
        const finalMessage = await channel.send({
          files: [...imageUrls],
          components: [buttonsRow],
        });

        // change message id to final id
        maze.messageID = finalMessage.id;
        maze.embedMessageID = embedMessage.id;
        await maze.save();

        submissionEmbed.addFields({
          name: "\u200b",
          value: `**Maze ID : ** \`${embedMessage.id}\``,
        });

        await embedMessage.edit({ embeds: [submissionEmbed] });

        // attach collectors to it
        await attachQuestMazeReviewCollector(client, maze as IMaze, "mz");

        // delete thread
        await submissionThread.delete();
      } catch (err) {
        console.error("Error in thread collector event : ", err);
      }
    });

    // if the user does not submit any images within 60 min cancel submission
    collector.on("end", async (collected, reason) => {
      try {
        if (reason === "time" && collected.size === 0) {
          // delete the thread and send message at channel tagging user
          await submissionThread.delete("interaction time out.");
          await channel.send({
            content: `Guild maze submission for <@${maze.userID}> has been rejected due to no image evidence provided.`,
          });
          return;
        }

        // if there is some submission but not enough
        if (reason === "title" && collected.size < submissionsRequired) {
          await submissionThread.delete("interaction time out.");
          await channel.send({
            content: `Guild maze submission for <@${maze.userID}> has been rejected due to insufficient image evidence provided.`,
          });
          return;
        }
      } catch (err) {
        console.error("Error in maze thread collector end : ", err);
      }
    });
  } catch (err) {
    console.error(
      "Error attaching collector to maze threaded submission : ",
      err
    );
  }
};
