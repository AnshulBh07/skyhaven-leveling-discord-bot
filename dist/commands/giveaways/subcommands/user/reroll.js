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
const discord_js_1 = require("discord.js");
const giveawaySchema_1 = __importDefault(require("../../../../models/giveawaySchema"));
const helperArrays_1 = require("../../../../data/helperArrays");
const configSchema_1 = __importDefault(require("../../../../models/configSchema"));
const permissionsCheck_1 = require("../../../../utils/permissionsCheck");
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "reroll",
                description: "Reroll a giveway for new winners",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "giveaway_id",
                        description: "ID of the giveaway you want to reroll",
                        type: discord_js_1.ApplicationCommandOptionType.String,
                        required: true,
                    },
                    {
                        name: "user",
                        description: "User to reroll",
                        type: discord_js_1.ApplicationCommandOptionType.User,
                    },
                ],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const giveaway_id = interaction.options.getString("giveaway_id");
                    const guildID = interaction.guildId;
                    const targetUser = interaction.options.getUser("user");
                    if (!giveaway_id || !guildID) {
                        yield interaction.editReply({
                            content: `⚠️ Invalid command. Please check your input and try again.`,
                        });
                        return;
                    }
                    const giveaway = yield giveawaySchema_1.default.findOne({
                        messageID: giveaway_id,
                        serverID: guildID,
                    });
                    if (!giveaway) {
                        yield interaction.editReply({
                            content: "🚫 Giveaway not found. Please ensure the provided ID is correct.",
                        });
                        return;
                    }
                    const guildConfig = yield configSchema_1.default.findOne({ serverID: guildID });
                    if (!guildConfig) {
                        yield interaction.editReply("🔍 This server could not be identified. Check if the bot has access.");
                        return;
                    }
                    const isAdmin = yield (0, permissionsCheck_1.isManager)(client, interaction.user.id, guildID, "ga");
                    if (interaction.user.id !== giveaway.hostID && !isAdmin) {
                        yield interaction.editReply({
                            content: "🚫 You do not have permission to perform this action.",
                        });
                        return;
                    }
                    // ALGORITHM -
                    // 1. If winner count is 1 just reroll that user, update db
                    // 2. if it is greather than 1 use the user specififed in interaction options
                    // reroll that particular user only
                    const { participants, serverID, channelID, prize, winnersCount, endMessageID, winners, } = giveaway;
                    const guild = yield client.guilds.fetch({
                        guild: serverID,
                        force: true,
                    });
                    const channel = yield guild.channels.fetch(channelID, {
                        force: true,
                    });
                    if (!channel || !channel.isTextBased() || endMessageID.length === 0) {
                        yield interaction.editReply({
                            content: "⚠️ Giveaway data appears to be corrupted. Please try again or contact an admin.",
                        });
                        return;
                    }
                    const thumbnail = new discord_js_1.AttachmentBuilder(helperArrays_1.leaderboardThumbnail).setName("thumbnail.png");
                    let new_winners = [];
                    const old_winners = winners;
                    let newWinner;
                    if (winnersCount > 1) {
                        if (!targetUser) {
                            yield interaction.editReply({
                                content: "Please specify the user you want to reroll.",
                            });
                            return;
                        }
                        const filtered_participants = participants.filter((user) => !old_winners.includes(user));
                        newWinner =
                            filtered_participants[Math.floor(Math.random() * filtered_participants.length)];
                        new_winners = old_winners.filter((winner) => winner !== targetUser.id);
                        new_winners.push(newWinner);
                        giveaway.participants = filtered_participants;
                        giveaway.winners = new_winners;
                        yield giveaway.save();
                    }
                    else {
                        // winner count is 1 choose a random winner
                        const filtered_participants = participants.filter((user) => user !== winners[0]);
                        newWinner =
                            filtered_participants[Math.floor(Math.random() * filtered_participants.length)];
                        new_winners = [newWinner];
                        giveaway.winners = new_winners;
                        giveaway.participants = filtered_participants;
                        yield giveaway.save();
                    }
                    const rerollEmbed = new discord_js_1.EmbedBuilder()
                        .setTitle(`🎉 Giveaway Rerolled!`)
                        .setDescription(`A new winner has been selected for **${prize}**!`)
                        .addFields({
                        name: `📢 **New Winner${new_winners.length > 1 ? "s" : ""} : **`,
                        value: `${Array.from(new_winners).map((winner) => `${winner === newWinner ? "🆕" : "🎊"} <@${winner}>`)}`,
                        inline: false,
                    })
                        .setColor(giveaway.role_color)
                        .setTimestamp()
                        .setFooter({
                        text: `Congratulations to the new winner${new_winners.length > 1 ? "s" : ""}!`,
                        iconURL: "attachment://thumbnail.png",
                    });
                    yield interaction.editReply({
                        content: "Reroll process started...",
                    });
                    const giveawayEndMessage = yield channel.messages.fetch(endMessageID);
                    yield giveawayEndMessage.reply(Object.assign(Object.assign({}, (giveaway.role_req
                        ? { content: `<@&${giveaway.role_req}>` }
                        : null)), { embeds: [rerollEmbed], files: [thumbnail] }));
                }
                catch (err) {
                    console.error("Error in giveaway reroll callback", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in giveaway reroll command", err);
        return undefined;
    }
});
exports.default = init;
