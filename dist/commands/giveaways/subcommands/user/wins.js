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
const userSchema_1 = __importDefault(require("../../../../models/userSchema"));
const giveawayUtils_1 = require("../../../../utils/giveawayUtils");
const helperArrays_1 = require("../../../../data/helperArrays");
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "wins",
                description: "Displays list of all the giveaways won by user.",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "user",
                        description: "target user",
                        type: discord_js_1.ApplicationCommandOptionType.User,
                        required: false,
                    },
                ],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                try {
                    const targetUser = (_a = interaction.options.getUser("user")) !== null && _a !== void 0 ? _a : interaction.user;
                    const guild = interaction.guild;
                    const channel = interaction.channel;
                    if (!guild || !channel || channel.type !== 0 || targetUser.bot) {
                        yield interaction.editReply({
                            content: `⚠️ Invalid command. Please check your input and try again.`,
                        });
                        return;
                    }
                    const user = yield userSchema_1.default.findOne({
                        userID: targetUser.id,
                        serverID: guild.id,
                    }).populate("giveaways.giveawaysWon");
                    if (!user) {
                        yield interaction.editReply({ content: "👤 User not found." });
                        return;
                    }
                    const allGiveaways = user.giveaways
                        .giveawaysWon;
                    let page = 0;
                    const pageSize = 3;
                    const totalPages = Math.ceil(allGiveaways.length / pageSize);
                    const description = `🎁 List of all the giveaways ${targetUser.username} has won.`;
                    const embed = (0, giveawayUtils_1.generateGiveawayListEmbed)(allGiveaways, page, pageSize, guild.name, description);
                    const thumbnail = new discord_js_1.AttachmentBuilder(helperArrays_1.leaderboardThumbnail).setName("thumbnail.png");
                    const generateButtons = () => {
                        const buttonsRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                            .setCustomId("wins_prev")
                            .setEmoji("⬅️")
                            .setDisabled(page === 0)
                            .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
                            .setCustomId("wins_next")
                            .setEmoji("➡️")
                            .setDisabled(page === totalPages - 1)
                            .setStyle(discord_js_1.ButtonStyle.Secondary));
                        return buttonsRow;
                    };
                    const initialButtons = generateButtons();
                    yield interaction.editReply({ content: "Generating your list..." });
                    const winsMsg = yield channel.send({
                        embeds: [embed],
                        files: [thumbnail],
                        components: [initialButtons],
                    });
                    const collector = winsMsg.createMessageComponentCollector({
                        filter: (i) => ["wins_prev", "wins_next"].includes(i.customId) &&
                            i.user.id === interaction.user.id,
                        time: 60000 * 10, //10 minutes
                    });
                    collector.on("collect", (btnInt) => __awaiter(void 0, void 0, void 0, function* () {
                        try {
                            yield btnInt.deferUpdate();
                            if (btnInt.customId === "wins_prev")
                                page--;
                            if (btnInt.customId === "wins_next")
                                page++;
                            const newPage = (0, giveawayUtils_1.generateGiveawayListEmbed)(allGiveaways, page, pageSize, guild.name, description);
                            const newButtonsRow = generateButtons();
                            yield winsMsg.edit({
                                embeds: [newPage],
                                components: [newButtonsRow],
                            });
                        }
                        catch (err) {
                            console.error("Error in giveaway wins collector on collect : ", err);
                            return;
                        }
                    }));
                    collector.on("end", (collected, reason) => __awaiter(void 0, void 0, void 0, function* () {
                        if (reason === "time") {
                            yield winsMsg.edit({
                                content: "⏱️ Interaction timeout.",
                                components: [],
                            });
                        }
                    }));
                }
                catch (err) {
                    console.error("Error in giveaway entries callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in giveaway entries command :", err);
        return undefined;
    }
});
exports.default = init;
