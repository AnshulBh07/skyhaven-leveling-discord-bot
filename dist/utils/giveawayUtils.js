"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGiveawayListEmbed = exports.endGiveaway = exports.attachCollector = void 0;
const discord_js_1 = require("discord.js");
const giveawaySchema_1 = __importDefault(require("../models/giveawaySchema"));
const configSchema_1 = __importDefault(require("../models/configSchema"));
const helperArrays_1 = require("../data/helperArrays");
const userSchema_1 = __importDefault(require("../models/userSchema"));
const getUpdatedEmbed = (giveawayData, message) => {
    const updatedEmbed = discord_js_1.EmbedBuilder.from(message.embeds[0]);
    updatedEmbed.setFields([
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
            value: `**⏱️ Ends : ** <t:${Math.floor(giveawayData.endsAt / 1000)}:R>  *(<t:${Math.floor(giveawayData.endsAt / 1000)}:f>)*`,
            inline: false,
        },
        {
            name: "\u200b",
            value: `**Entries : ** ${giveawayData.participants.length} `,
            inline: false,
        },
        {
            name: "\u200b",
            value: `**Giveaway ID : ** \`${giveawayData.messageID}\``,
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
            : []),
    ]);
    return updatedEmbed;
};
const attachCollector = (client, giveawayData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const guild = yield client.guilds.fetch(giveawayData.serverID);
        const giveawayChannel = yield guild.channels.fetch(giveawayData.channelID);
        if (!giveawayChannel || !giveawayChannel.isTextBased())
            return undefined;
        const giveawayMessage = yield giveawayChannel.messages.fetch(giveawayData.messageID);
        const collector = giveawayMessage.createMessageComponentCollector({
            filter: (i) => ["participate", "leave"].includes(i.customId),
            time: giveawayData.endsAt - Date.now(),
        });
        // on button interaction add a user to giveaway
        collector.on("collect", (btnInt) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const reactorID = btnInt.user.id;
                if (btnInt.customId === "participate") {
                    yield btnInt.deferReply({ flags: "Ephemeral" });
                    const freshData = yield giveawaySchema_1.default.findOne({
                        messageID: giveawayData.messageID,
                    });
                    if (!freshData) {
                        yield btnInt.editReply({
                            content: "Giveaway info not found. Corrupted giveaway.",
                        });
                        return;
                    }
                    const guildConfig = yield configSchema_1.default.findOne({
                        serverID: giveawayData.serverID,
                    });
                    if (!guildConfig) {
                        yield btnInt.editReply({ content: "No guild config found" });
                        return;
                    }
                    const { banList } = guildConfig.giveawayConfig;
                    const allParticipants = freshData.participants;
                    // check if the user is banned
                    const bannedUsers = banList.map((user) => user.userID);
                    if (bannedUsers.includes(reactorID)) {
                        yield btnInt.editReply({
                            content: "You are banned from participating in this giveaway. Please contact admin for further info.",
                        });
                        return;
                    }
                    // if the user has already participated
                    if (allParticipants.includes(reactorID)) {
                        yield btnInt.editReply({
                            content: "You have already participated in this giveaway",
                        });
                        return;
                    }
                    // now check if the user meets all requirements (role)
                    if (giveawayData.role_req) {
                        const member = yield guild.members.fetch(reactorID);
                        const member_roles = Array.from(member.roles.cache.entries()).map(([_, role]) => role.id);
                        if (member.user.bot ||
                            !member_roles.includes(giveawayData.role_req)) {
                            yield btnInt.editReply({
                                content: "You do not have the role required to participate in this giveaway.",
                            });
                            return;
                        }
                    }
                    // if not add the user to participation list
                    const updatedGA = yield giveawaySchema_1.default.findOneAndUpdate({
                        messageID: giveawayMessage.id,
                    }, { $push: { participants: reactorID } }, { new: true });
                    if (updatedGA) {
                        yield giveawayMessage.edit({
                            embeds: [getUpdatedEmbed(updatedGA, giveawayMessage)],
                        });
                    }
                    yield btnInt.editReply({
                        content: "You've sucessfully registered for giveaway.",
                    });
                    yield userSchema_1.default.findOneAndUpdate({ userID: reactorID }, { $push: { "giveaways.giveawaysEntries": freshData._id } });
                }
                if (btnInt.customId === "leave") {
                    yield btnInt.deferReply({ flags: "Ephemeral" });
                    const freshData = yield giveawaySchema_1.default.findOne({
                        messageID: giveawayData.messageID,
                    });
                    if (!freshData)
                        return;
                    const allParticipants = freshData.participants;
                    if (!allParticipants.includes(reactorID)) {
                        yield btnInt.editReply({
                            content: "Bro, you've never been a participant in the first place.",
                        });
                        return;
                    }
                    const updatedGA = yield giveawaySchema_1.default.findOneAndUpdate({ messageID: giveawayMessage.id }, { $pull: { participants: reactorID } }, { new: true });
                    if (updatedGA) {
                        yield giveawayMessage.edit({
                            embeds: [getUpdatedEmbed(updatedGA, giveawayMessage)],
                        });
                    }
                    yield btnInt.editReply({
                        content: "You've left the giveaway",
                    });
                    yield userSchema_1.default.findOneAndUpdate({ userID: reactorID }, { $pull: { "giveaways.giveawaysEntries": freshData._id } });
                }
            }
            catch (err) {
                console.error("Error inside giveaway button collector :", err);
            }
        }));
        return collector;
    }
    catch (err) {
        console.error("Error in attach collector function", err);
        return undefined;
    }
});
exports.attachCollector = attachCollector;
const endGiveaway = (client, giveawayID) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const giveaway = yield giveawaySchema_1.default.findOne({ messageID: giveawayID });
        if (!giveaway)
            return;
        // collector is stopped first thing in set timeout
        const { participants, winnersCount, messageID, channelID, serverID } = giveaway;
        const guild = yield client.guilds.fetch({ guild: serverID, force: true });
        const messageChannel = yield guild.channels.fetch(channelID, {
            force: true,
        });
        if (!messageChannel || !messageChannel.isTextBased())
            return;
        const giveawayMessage = yield messageChannel.messages.fetch({
            message: messageID,
            force: true,
        });
        const giveawayChannel = messageChannel;
        if (!giveawayChannel || !giveawayChannel.isTextBased())
            return;
        const winners = new Set();
        // now we have the list of participants select winners from it
        if (participants.length <= giveaway.winnersCount)
            participants.forEach((participant) => winners.add(participant));
        else
            while (winners.size !== winnersCount) {
                const winner = participants[Math.floor(Math.random() * participants.length)];
                if (!winners.has(winner))
                    winners.add(winner);
            }
        const thumbnailLogo = new discord_js_1.AttachmentBuilder(helperArrays_1.leaderboardThumbnail).setName("thumbnail.png");
        const giveawayEmbed = new discord_js_1.EmbedBuilder()
            .setTitle(participants.length === 0
            ? "🎁 Giveaway Ended... Kinda"
            : "🎉 Giveaway Ended!")
            .setDescription(participants.length === 0
            ? "Not even your tuyuls joined. That’s cold. 💀"
            : `The giveaway for **${giveaway.prize}** has concluded.`)
            .addFields({
            name: "\u200b",
            value: `**Prize : ** ${giveaway.prize}`,
            inline: false,
        }, {
            name: "\u200b",
            value: `**Winners : ** ${participants.length === 0
                ? " No winners. No glory."
                : Array.from(winners)
                    .map((user) => `<@${user}>`)
                    .join(",")}`,
            inline: false,
        }, {
            name: "\u200b",
            value: `**Hosted By : ** <@${giveaway.hostID}>`,
            inline: false,
        }, {
            name: "\u200b",
            value: `**Created At : ** <t:${Math.floor(giveaway.createdAt / 1000)}:f>`,
            inline: true,
        }, {
            name: "\u200b",
            value: `**Ended At : ** <t:${Math.floor(giveaway.endsAt / 1000)}:f>`,
            inline: true,
        }, {
            name: "\u200b",
            value: `**Giveaway ID : ** ${giveaway.messageID}`,
            inline: false,
        }, ...(giveaway.role_req
            ? [
                {
                    name: "\u200b",
                    value: `**Role Required : **<@&${giveaway.role_req}>`,
                    inline: false,
                },
            ]
            : []))
            .setColor(giveaway.role_color)
            .setFooter({
            text: participants.length === 0
                ? `Next time, maybe bribe them with cookies 🍪.\n`
                : `Congratulations to the winner${winners.size > 1 ? "s" : ""}\n${guild.name} Giveaways\n`,
            iconURL: "attachment://thumbnail.png",
        })
            .setTimestamp();
        if (giveaway.imageUrl)
            giveawayEmbed.setImage(giveaway.imageUrl);
        const roleMention = giveaway.role_req ? `<@&${giveaway.role_req}>` : null;
        const giveawayEndMessage = yield giveawayChannel.send({
            embeds: [giveawayEmbed],
            files: [thumbnailLogo],
            allowedMentions: {
                roles: giveaway.role_req ? [giveaway.role_req] : [],
            },
        });
        //   update db field as well
        giveaway.isEnded = true;
        giveaway.winners = Array.from(winners);
        giveaway.endMessageID = giveawayEndMessage.id;
        yield giveaway.save();
        // instead of deleting the original message let us update it with a new embed
        const afterEndEmbed = new discord_js_1.EmbedBuilder()
            .setTitle(`Giveaway Ended - ${giveaway.prize}`)
            .setColor(giveaway.role_color)
            .addFields({
            name: "\u200b",
            value: `**🪪 Giveaway ID : ** \`${giveaway.messageID}\``,
            inline: false,
        }, {
            name: "\u200b",
            value: `**🎉 Winners : ** ${winners.size === 0
                ? "No winners."
                : Array.from(winners)
                    .map((winner) => `<@${winner}>`)
                    .join(",")}`,
            inline: false,
        }, {
            name: "\u200b",
            value: `**Ended on : ** <t:${Math.floor(Date.now() / 1000)}:f>`,
            inline: false,
        })
            .setFooter({
            text: `${guild.name} Giveaways`,
            iconURL: "attachment://thumbnail.png",
        });
        const messageLink = `https://discord.com/channels/${giveaway.serverID}/${giveaway.channelID}/${giveawayEndMessage.id}`;
        const linkButton = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setLabel("Jump to winner announcement.")
            .setStyle(discord_js_1.ButtonStyle.Link)
            .setURL(messageLink));
        yield giveawayMessage.edit({
            embeds: [afterEndEmbed],
            components: [linkButton],
            files: [thumbnailLogo],
        });
        // update users won in db
        for (const winner of winners) {
            yield userSchema_1.default.findOneAndUpdate({ userID: winner }, { $push: { "giveaways.giveawaysWon": giveaway._id } });
        }
    }
    catch (err) {
        console.error("Error in end giveaway function :", err);
    }
});
exports.endGiveaway = endGiveaway;
const generateGiveawayListEmbed = (allGiveaways, page, pageSize, guildName, description) => {
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    const giveaways = allGiveaways.slice(startIndex, endIndex);
    const embed = new discord_js_1.EmbedBuilder()
        .setTitle(description)
        .setColor("Gold")
        .setDescription(giveaways.length > 0
        ? giveaways
            .map((g, i) => `**${startIndex + i + 1}. ${g.prize}**\n- 🪪 Giveaway ID : ${`\`${g.messageID}\``}\n- 👤 Hosted by : <@${g.hostID}>\n- 🎉 Winners : **${g.winnersCount}**\n- 📢 Created : <t:${Math.floor(g.createdAt / 100)}:f>\n- ⏳ Ends : <t:${Math.floor(g.endsAt / 1000)}:f>`)
            .join("\n\n")
        : "*No active giveaways right now. Check back later!*")
        .setFooter({
        text: `${guildName} Giveaways`,
        iconURL: "attachment://thumbnail.png",
    })
        .setTimestamp();
    return embed;
};
exports.generateGiveawayListEmbed = generateGiveawayListEmbed;
