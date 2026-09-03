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
const giveawayUtils_1 = require("../../../../utils/giveawayUtils");
const helperArrays_1 = require("../../../../data/helperArrays");
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "list",
                description: "Displays a list of all active giveaways for current server.",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const guildID = interaction.guildId;
                    const channel = interaction.channel;
                    if (!guildID || !channel || channel.type !== discord_js_1.ChannelType.GuildText) {
                        yield interaction.editReply({
                            content: `⚠️ Invalid command. Please check your input and try again.`,
                        });
                        return;
                    }
                    const guild = yield client.guilds.fetch(guildID);
                    //   get all the giveaways for current server
                    const giveaways = yield giveawaySchema_1.default.find({
                        serverID: guildID,
                        isEnded: false,
                    });
                    let page = 0;
                    const pageSize = 3;
                    const totalPages = Math.ceil(giveaways.length / pageSize);
                    const description = `🎁 List of Active Giveaways`;
                    const embed = (0, giveawayUtils_1.generateGiveawayListEmbed)(giveaways, page, pageSize, guild.name, description);
                    const thumbnail = new discord_js_1.AttachmentBuilder(helperArrays_1.leaderboardThumbnail).setName("thumbnail.png");
                    const generateButtons = () => {
                        const buttonsRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                            .setCustomId("list_prev")
                            .setEmoji("⬅️")
                            .setDisabled(page === 0)
                            .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
                            .setCustomId("list_next")
                            .setEmoji("➡️")
                            .setDisabled(page >= totalPages - 1)
                            .setStyle(discord_js_1.ButtonStyle.Secondary));
                        return buttonsRow;
                    };
                    yield interaction.editReply({ content: "Generating your list..." });
                    const initialButtons = generateButtons();
                    const reply = yield channel.send({
                        embeds: [embed],
                        files: [thumbnail],
                        components: [initialButtons],
                    });
                    const collector = reply.createMessageComponentCollector({
                        filter: (i) => ["list_prev", "list_next"].includes(i.customId) &&
                            i.user.id === interaction.user.id &&
                            !i.user.bot,
                        time: 60000 * 10, //10 minutes
                    });
                    collector.on("collect", (btnInt) => __awaiter(void 0, void 0, void 0, function* () {
                        try {
                            yield btnInt.deferReply();
                            if (btnInt.customId === "list_prev")
                                page--;
                            if (btnInt.customId === "list_next")
                                page++;
                            const newPage = (0, giveawayUtils_1.generateGiveawayListEmbed)(giveaways, page, pageSize, guild.name, description);
                            const newButtonsRow = generateButtons();
                            yield btnInt.editReply({
                                embeds: [newPage],
                                components: [newButtonsRow],
                            });
                        }
                        catch (err) {
                            console.error("Error in giveaway list collector on collect : ", err);
                            return;
                        }
                    }));
                    collector.on("end", (collected, reason) => __awaiter(void 0, void 0, void 0, function* () {
                        if (reason === "time") {
                            yield reply.edit({
                                content: "⏱️ Interaction timeout.",
                                components: [],
                            });
                        }
                    }));
                }
                catch (err) {
                    console.error("Error in giveaway list callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in giveaway list command :", err);
        return undefined;
    }
});
exports.default = init;
