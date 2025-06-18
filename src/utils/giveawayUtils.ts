import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  ColorResolvable,
  EmbedBuilder,
} from "discord.js";
import Giveaway from "../models/giveawaySchema";
import { IGiveaway } from "./interfaces";
import Config from "../models/configSchema";
import { leaderboardThumbnail } from "../data/helperArrays";
import User from "../models/userSchema";

const getUpdatedEmbed = (giveawayData: IGiveaway) => {
  const giveawayEmbed = new EmbedBuilder()
    .setTitle(`🎁 SKYHAVEN GIVEAWAY - ${giveawayData.prize}\n\n`)
    .setThumbnail("attachment://thumbnail.png")
    .setColor(giveawayData.role_color as ColorResolvable)
    .setDescription(`${giveawayData.starterMessage}`)
    .addFields(
      {
        name: "\u200b",
        value: `**👤 Hosted by : ** <@${giveawayData.hostID}>`,
        inline: true,
      },
      {
        name: "\u200b",
        value: `**🎊 Winners : ** ${giveawayData.winnersCount}`,
        inline: true,
      },
      {
        name: "\u200b",
        value: `**⏱️ Ends : ** <t:${Math.floor(
          giveawayData.endsAt / 1000
        )}:R>  *(<t:${Math.floor(giveawayData.endsAt / 1000)}:f>)*`,
        inline: false,
      },
      {
        name: "\u200b",
        value: `**Entries : ** ${giveawayData.participants.length} `,
        inline: false,
      },
      {
        name: "\u200b",
        value: `**Giveaway ID : ** ${giveawayData.messageID}`,
        inline: false,
      },
      ...(giveawayData.role_req
        ? [
            {
              name: "\u200b",
              value: `**🎯 Required Role : ** <@&${giveawayData.role_req}>`,
              inline: true,
            },
          ]
        : [])
    )
    .setFooter({ text: "Press 🎉 to participate.\nPress 🏃‍♂️ to leave.\n" })
    .setTimestamp(new Date());

  if (giveawayData.imageUrl) giveawayEmbed.setImage(giveawayData.imageUrl);

  return giveawayEmbed;
};

export const attachCollector = async (
  client: Client,
  giveawayData: IGiveaway
) => {
  try {
    const guild = await client.guilds.fetch(giveawayData.serverID);
    const giveawayChannel = await guild.channels.fetch(giveawayData.channelID);

    const guildConfig = await Config.findOne({ serverID: guild.id });

    if (!giveawayChannel || !giveawayChannel.isTextBased() || !guildConfig)
      return undefined;

    const { banList } = guildConfig.giveawayConfig;

    const giveawayMessage = await giveawayChannel.messages.fetch(
      giveawayData.messageID
    );

    const collector = giveawayMessage.createMessageComponentCollector({
      filter: (i) => ["participate", "leave"].includes(i.customId),
      time: giveawayData.endsAt - Date.now(),
    });

    // on button interaction add a user to giveaway
    collector.on("collect", async (btnInt) => {
      try {
        const reactorID = btnInt.user.id;

        if (btnInt.customId === "participate") {
          await btnInt.deferReply({ flags: "Ephemeral" });
          const freshData = await Giveaway.findOne({
            messageID: giveawayData.messageID,
          });

          if (!freshData) return;

          const allParticipants = freshData.participants;
          // check if the user is banned
          const bannedUsers = banList.map((user) => user.userID);

          if (bannedUsers.includes(reactorID)) {
            await btnInt.editReply({
              content:
                "You are banned from participating in this giveaway. Please contact admin for further info.",
            });
            return;
          }

          // if the user has already participated
          if (allParticipants.includes(reactorID)) {
            await btnInt.editReply({
              content: "You have already participated in this giveaway",
            });
            return;
          }

          // now check if the user meets all requirements (role)
          if (giveawayData.role_req) {
            const member = await guild.members.fetch(reactorID);
            const member_roles = Array.from(member.roles.cache.entries()).map(
              ([_, role]) => role.id
            );

            if (
              member.user.bot ||
              !member_roles.includes(giveawayData.role_req)
            ) {
              await btnInt.editReply({
                content:
                  "You do not have the role required to participate in this giveaway.",
              });
              return;
            }
          }

          // if not add the user to participation list
          const updatedGA = await Giveaway.findOneAndUpdate(
            {
              messageID: giveawayMessage.id,
            },
            { $push: { participants: reactorID } },
            { new: true }
          );

          if (updatedGA) {
            await giveawayMessage.edit({
              embeds: [getUpdatedEmbed(updatedGA)],
            });
          }

          await btnInt.editReply({
            content: "You've sucessfully registered for giveaway.",
          });

          await User.findOneAndUpdate(
            { userID: reactorID },
            { $push: { "giveaways.giveawaysEntries": freshData._id } }
          );
        }

        if (btnInt.customId === "leave") {
          await btnInt.deferReply();
          const freshData = await Giveaway.findOne({
            messageID: giveawayData.messageID,
          });

          if (!freshData) return;

          const allParticipants = freshData.participants;

          if (!allParticipants.includes(reactorID)) {
            await btnInt.editReply({
              content:
                "Bro, you've never been a participant in the first place.",
            });
            return;
          }

          const updatedGA = await Giveaway.findOneAndUpdate(
            { messageID: giveawayMessage.id },
            { $pull: { participants: reactorID } },
            { new: true }
          );

          if (updatedGA) {
            await giveawayMessage.edit({
              embeds: [getUpdatedEmbed(updatedGA)],
            });
          }

          await btnInt.editReply({
            content: "You've left the giveaway",
          });

          await User.findOneAndUpdate(
            { userID: reactorID },
            { $pull: { "giveaways.giveawaysEntries": freshData._id } }
          );
        }
      } catch (err) {
        console.error("Error inside giveaway button collector :", err);
      }
    });

    return collector;
  } catch (err) {
    console.error("Error in attach collector function", err);
    return undefined;
  }
};

export const endGiveaway = async (client: Client, giveawayID: string) => {
  try {
    const giveaway = await Giveaway.findOne({ messageID: giveawayID });

    if (!giveaway) return;

    // collector is stopped first thing in set timeout
    const { participants, winnersCount, messageID, channelID, serverID } =
      giveaway;

    const guild = await client.guilds.fetch({ guild: serverID, force: true });
    const messageChannel = await guild.channels.fetch(channelID, {
      force: true,
    });

    if (!messageChannel || !messageChannel.isTextBased()) return;

    const giveawayMessage = await messageChannel.messages.fetch({
      message: messageID,
      force: true,
    });

    // get giveaway notification channel from config
    const guildConfig = await Config.findOne({ serverID: guild.id });

    if (!guildConfig) return;

    const { giveawayChannelID } = guildConfig.giveawayConfig;

    const giveawayChannel = guild.channels.cache.find(
      (channel) => channel.id === giveawayChannelID
    );

    if (!giveawayChannel || !giveawayChannel.isTextBased()) return;

    const winners = new Set<string>();

    // now we have the list of participants select winners from it
    if (participants.length <= giveaway.winnersCount)
      participants.forEach((participant) => winners.add(participant));
    else
      while (winners.size !== winnersCount) {
        const winner =
          participants[Math.floor(Math.random() * participants.length)];

        if (!winners.has(winner)) winners.add(winner);
      }

    const thumbnailLogo = new AttachmentBuilder(leaderboardThumbnail).setName(
      "thumbnail.png"
    );

    const thumbnailSad = new AttachmentBuilder(
      "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExY2E1bWJnbzB2dDNyZThtMjRxNDFmaThmdXI3OGswZGk5eG9zNWl0ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3OhXBaoR1tVPW/giphy.gif"
    ).setName("thumbnail.png");

    const giveawayEmbed = new EmbedBuilder()
      .setTitle(
        participants.length === 0
          ? "🎁 Giveaway Ended... Kinda"
          : "🎉 Giveaway Ended!"
      )
      .setDescription(
        participants.length === 0
          ? "Not even your tuyuls joined. That’s cold. 💀"
          : `The giveaway for **${giveaway.prize}** has concluded.`
      )
      .addFields(
        {
          name: "\u200b",
          value: `**Prize : ** ${giveaway.prize}`,
          inline: false,
        },
        {
          name: "\u200b",
          value: `**Winners : ** ${
            participants.length === 0
              ? " No winners. No glory."
              : Array.from(winners)
                  .map((user) => `<@${user}>`)
                  .join(",")
          }`,
          inline: false,
        },
        {
          name: "\u200b",
          value: `**Hosted By : ** <@${giveaway.hostID}>`,
          inline: false,
        },
        {
          name: "\u200b",
          value: `**Created At : ** <t:${Math.floor(
            giveaway.createdAt / 1000
          )}:f>`,
          inline: true,
        },
        {
          name: "\u200b",
          value: `**Ended At : ** <t:${Math.floor(giveaway.endsAt / 1000)}:f>`,
          inline: true,
        },
        {
          name: "\u200b",
          value: `**Giveaway ID : ** ${giveaway.messageID}`,
          inline: false,
        },
        ...(giveaway.role_req
          ? [
              {
                name: "\u200b",
                value: `**Role Required : **<@&${giveaway.role_req}>`,
                inline: false,
              },
            ]
          : [])
      )
      .setColor(giveaway.role_color as ColorResolvable)
      .setThumbnail(`attachment://thumbnail.png`)
      .setFooter({
        text:
          participants.length === 0
            ? `Next time, maybe bribe them with cookies 🍪.\n`
            : `Congratulations to the winner${winners.size > 1 ? "s" : ""}\n`,
      })
      .setTimestamp();

    if (giveaway.imageUrl) giveawayEmbed.setImage(giveaway.imageUrl);

    const roleMention = giveaway.role_req ? `<@&${giveaway.role_req}>` : null;

    const giveawayEndMessage = await giveawayChannel.send({
      ...(roleMention && { content: roleMention }),
      embeds: [giveawayEmbed],
      files: [participants.length === 0 ? thumbnailSad : thumbnailLogo],
      allowedMentions: {
        roles: giveaway.role_req ? [giveaway.role_req] : [],
      },
    });

    //   update db field as well
    giveaway.isEnded = true;
    giveaway.winners = Array.from(winners);
    giveaway.endMessageID = giveawayEndMessage.id;

    await giveaway.save();

    // instead of deleting the original message let us update it with a new embed
    const afterEndEmbed = new EmbedBuilder()
      .setTitle(`Giveaway Ended - ${giveaway.prize}`)
      .setColor(giveaway.role_color as ColorResolvable)
      .setThumbnail("attachment://thumbnail.png")
      .addFields(
        {
          name: "\u200b",
          value: `**🪪 Giveaway ID : ** ${giveaway.messageID}`,
          inline: false,
        },
        {
          name: "\u200b",
          value: `**🎉 Winners : ** ${
            winners.size === 0
              ? "No winners."
              : Array.from(winners)
                  .map((winner) => `<@${winner}>`)
                  .join(",")
          }`,
          inline: false,
        },
        {
          name: "\u200b",
          value: `**Ended on : ** <t:${Math.floor(Date.now() / 1000)}:f>`,
          inline: false,
        }
      )
      .setFooter({ text: `${guild.name} Giveaways` });

    const messageLink = `https://discord.com/channels/${giveaway.serverID}/${giveaway.channelID}/${giveawayEndMessage.id}`;

    const linkButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("Jump to winner announcement.")
        .setStyle(ButtonStyle.Link)
        .setURL(messageLink)
    );

    await giveawayMessage.edit({
      embeds: [afterEndEmbed],
      components: [linkButton],
    });

    // update users won in db
    for (const winner of winners) {
      await User.findOneAndUpdate(
        { userID: winner },
        { $push: { "giveaways.giveawaysWon": giveaway._id } }
      );
    }
  } catch (err) {
    console.error("Error in end giveaway function :", err);
  }
};

export const generateGiveawayListEmbed = (
  allGiveaways: IGiveaway[],
  page: number,
  pageSize: number,
  guildName: string,
  description: string
) => {
  const startIndex = page * pageSize;
  const endIndex = startIndex + pageSize;

  const giveaways = allGiveaways.slice(startIndex, endIndex);

  const embed = new EmbedBuilder()
    .setTitle(description)
    .setColor("Gold")
    .setThumbnail("attachment://thumbnail.png")
    .setDescription(
      giveaways.length > 0
        ? giveaways
            .map(
              (g, i) =>
                `**${startIndex + i + 1}. [${g.prize}]**\n- 🪪 Giveaway ID : ${
                  g.messageID
                }\n- 👤 Hosted by : <@${g.hostID}>\n- 🎉 Winners : **${
                  g.winnersCount
                }**\n- ⏳ Ends : <t:${Math.floor(g.endsAt / 1000)}:R>`
            )
            .join("\n\n")
        : "*No active giveaways right now. Check back later!*"
    )
    .setFooter({
      text: `${guildName} Giveaways`,
    })
    .setTimestamp();

  return embed;
};
