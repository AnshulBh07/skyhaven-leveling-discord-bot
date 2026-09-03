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
const helperArrays_1 = require("../../../../data/helperArrays");
const getDateString_1 = require("../../../../utils/getDateString");
const genearteLeaderboardCard_1 = require("../../../../canvas/genearteLeaderboardCard");
const staticAssetCache_1 = require("../../../../canvas/utils/staticAssetCache");
const userSchema_1 = __importDefault(require("../../../../models/userSchema"));
const leaderboardTypes = [
    {
        label: "Overall XP",
        value: "overall",
        description: "Total XP from all activities",
    },
    {
        label: "Text XP",
        value: "text",
        description: "XP earned by sending messages",
    },
    {
        label: "Voice XP",
        value: "voice",
        description: "XP gained from time spent in voice channels",
    },
    {
        label: "Weekly XP",
        value: "weekly",
        description: "Top users based on weekly activity",
    },
    {
        label: "Monthly XP",
        value: "monthly",
        description: "Top users based on monthly activity",
    },
];
// this command generates initial leaderboard with a button row and a select menu
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "leaderboard",
                description: "Show top users in the server by level",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const guild = interaction.guild;
                    const channel = interaction.channel;
                    if (!guild || !channel || channel.type !== discord_js_1.ChannelType.GuildText) {
                        yield interaction.editReply({
                            content: "⚠️ Invalid command. Please check your input and try again.",
                        });
                        return;
                    }
                    // get all users for current guild with lean and projection
                    const users = (yield userSchema_1.default.find({ serverID: guild.id }, { userID: 1, leveling: 1 }).lean());
                    // initial states for leaderboard
                    let page = 0;
                    const pageSize = 10;
                    let type = "overall";
                    const totalPages = Math.ceil(users.length / pageSize);
                    // create a button row
                    const buttonRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                        .setCustomId("level_leaderboard_prev")
                        .setEmoji("⬅️")
                        .setStyle(discord_js_1.ButtonStyle.Secondary)
                        .setDisabled(page === 0), new discord_js_1.ButtonBuilder()
                        .setCustomId("level_leaderboard_next")
                        .setEmoji("➡️")
                        .setStyle(discord_js_1.ButtonStyle.Secondary)
                        .setDisabled(page === totalPages - 1));
                    const thumbnail = new discord_js_1.AttachmentBuilder(helperArrays_1.leaderboardThumbnail).setName("thumbnail.png");
                    // create a select menu
                    const selectRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.StringSelectMenuBuilder()
                        .setCustomId("type_menu")
                        .setPlaceholder("OverallXP")
                        .addOptions(leaderboardTypes.map((option, index) => {
                        const newOption = new discord_js_1.StringSelectMenuOptionBuilder()
                            .setLabel(option.label)
                            .setDescription(option.description)
                            .setValue(option.value)
                            .setDefault(type === option.value);
                        return newOption;
                    })));
                    const generateLeaderboard = (usersArr, pageSize, page, type) => {
                        const now = new Date();
                        const currWeek = (0, getDateString_1.getWeekOfYear)(now);
                        const currMonth = now.getMonth();
                        const currYear = now.getFullYear();
                        const getXpForPeriod = (xpPerDay, period) => {
                            return Array.from(xpPerDay.entries()).reduce((sum, [dateStr, xp]) => {
                                const date = new Date(dateStr);
                                if (period === "weekly")
                                    return (0, getDateString_1.getWeekOfYear)(date) === currWeek &&
                                        date.getFullYear() === currYear
                                        ? sum + xp
                                        : sum;
                                if (period === "monthly")
                                    return date.getMonth() === currMonth &&
                                        date.getFullYear() === currYear
                                        ? sum + xp
                                        : sum;
                                return sum;
                            }, 0);
                        };
                        const sortedUsers = [...usersArr].sort((a, b) => {
                            const getXp = (user) => {
                                switch (type) {
                                    case "overall":
                                        return user.leveling.totalXp || 0;
                                    case "text":
                                        return user.leveling.textXp || 0;
                                    case "voice":
                                        return user.leveling.voiceXp || 0;
                                    case "weekly":
                                        return getXpForPeriod(user.leveling.xpPerDay, "weekly");
                                    case "monthly":
                                        return getXpForPeriod(user.leveling.xpPerDay, "monthly");
                                    default:
                                        return user.leveling.totalXp || 0;
                                }
                            };
                            return getXp(b) - getXp(a); // Descending
                        });
                        const startIndex = page * pageSize;
                        const endIndex = startIndex + pageSize;
                        const leaderboardList = sortedUsers
                            .slice(startIndex, endIndex)
                            .map((user, idx) => {
                            const displayedXp = (() => {
                                switch (type) {
                                    case "overall":
                                        return user.leveling.totalXp || 0;
                                    case "text":
                                        return user.leveling.textXp || 0;
                                    case "voice":
                                        return user.leveling.voiceXp || 0;
                                    case "weekly":
                                        return getXpForPeriod(user.leveling.xpPerDay, "weekly");
                                    case "monthly":
                                        return getXpForPeriod(user.leveling.xpPerDay, "monthly");
                                    default:
                                        return user.leveling.totalXp || 0;
                                }
                            })();
                            const userInfo = {
                                userID: user.userID,
                                level: user.leveling.level,
                                rank: startIndex + idx + 1,
                                xp: displayedXp,
                                currentRole: user.leveling.currentRole,
                            };
                            return userInfo;
                        });
                        return leaderboardList;
                    };
                    let leaderboardList = generateLeaderboard(users, pageSize, page, type);
                    // get random background from cached static images
                    const staticAssets = yield (0, staticAssetCache_1.getStaticCanvasAssets)();
                    const randomBg = staticAssets.leaderboardBgs[Math.floor(Math.random() * staticAssets.leaderboardBgs.length)];
                    // get all roles for the guild
                    const roles = Array.from(guild.roles.cache).map(([_, role]) => role);
                    const leaderboardCard = yield (0, genearteLeaderboardCard_1.generateLeaderboardCanvas)(client, leaderboardList, type, randomBg, roles);
                    // the message to attach components with
                    const leaderboardEmbed = new discord_js_1.EmbedBuilder()
                        .setTitle("🏆 LEADERBOARD")
                        .setDescription(`Here's the current ranking based on **${type.charAt(0).toUpperCase() + type.slice(1)} XP**.`)
                        .setColor("Gold")
                        .setThumbnail("attachment://thumbnail.png");
                    if (leaderboardCard)
                        leaderboardEmbed.setImage("attachment://bg.png");
                    yield interaction.editReply({ content: "Generating leaderboard..." });
                    const reply = yield channel.send({
                        embeds: [leaderboardEmbed],
                        components: [buttonRow, selectRow],
                        files: [thumbnail, ...(leaderboardCard ? [leaderboardCard] : [])],
                    });
                    // now create a collector to enable interaction
                    const collector = reply.createMessageComponentCollector({
                        time: 60000 * 10,
                        filter: (i) => i.user.id === interaction.user.id &&
                            [
                                "level_leaderboard_prev",
                                "level_leaderboard_next",
                                "type_menu",
                            ].includes(i.customId) &&
                            !i.user.bot,
                    });
                    collector.on("collect", (compInt) => __awaiter(void 0, void 0, void 0, function* () {
                        try {
                            // if button interaction
                            if (compInt.isButton()) {
                                yield compInt.deferUpdate();
                                if (compInt.customId === "level_leaderboard_prev")
                                    page--;
                                if (compInt.customId === "level_leaderboard_next")
                                    page++;
                                buttonRow.components[0].setDisabled(page <= 0);
                                buttonRow.components[1].setDisabled(page >= totalPages - 1);
                                const leaderboardList = generateLeaderboard(users, pageSize, page, type);
                                // generate new embed
                                const newCard = yield (0, genearteLeaderboardCard_1.generateLeaderboardCanvas)(client, leaderboardList, type, randomBg, roles);
                                if (newCard)
                                    leaderboardEmbed.setImage("attachment://bg.png");
                                yield reply.edit({
                                    embeds: [leaderboardEmbed],
                                    components: [buttonRow, selectRow],
                                    files: [thumbnail, ...(newCard ? [newCard] : [])],
                                });
                            }
                            // if select menu interaction
                            if (compInt.isStringSelectMenu()) {
                                yield compInt.deferUpdate();
                                type = compInt.values[0];
                                page = 0;
                                const leaderboardList = generateLeaderboard(users, pageSize, page, type);
                                buttonRow.components[0].setDisabled(page <= 0);
                                buttonRow.components[1].setDisabled(page >= totalPages - 1);
                                // generate new embed
                                const newCard = yield (0, genearteLeaderboardCard_1.generateLeaderboardCanvas)(client, leaderboardList, type, randomBg, roles);
                                if (newCard)
                                    leaderboardEmbed.setImage("attachment://bg.png");
                                // new select row to show visual change in select menu const selectRow =
                                const newSelectMenu = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.StringSelectMenuBuilder()
                                    .setCustomId("type_menu")
                                    .setPlaceholder("OverallXP")
                                    .addOptions(leaderboardTypes.map((option, index) => {
                                    const newOption = new discord_js_1.StringSelectMenuOptionBuilder()
                                        .setLabel(option.label)
                                        .setDescription(option.description)
                                        .setValue(option.value)
                                        .setDefault(type === option.value);
                                    return newOption;
                                })));
                                yield reply.edit({
                                    embeds: [leaderboardEmbed],
                                    components: [buttonRow, newSelectMenu],
                                    files: [thumbnail, ...(newCard ? [newCard] : [])],
                                });
                            }
                        }
                        catch (err) {
                            console.error("Error in lvl leaderboard collector on collect event : ", err);
                        }
                    }));
                    collector.on("end", (collected, reason) => __awaiter(void 0, void 0, void 0, function* () {
                        try {
                            if (reason === "time" && !collected.size) {
                                yield reply.edit({
                                    content: "⏱️ Time out. No interaction was detected from user.",
                                    components: [],
                                });
                                return;
                            }
                            yield reply.edit({
                                content: "🔒 This leaderboard session has expired.",
                                components: [],
                            });
                        }
                        catch (err) {
                            console.error(err);
                        }
                    }));
                }
                catch (err) {
                    console.error("Error in lvl leaderboard subcommand callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in lvl leaderboard subcommand callback : ", err);
        return undefined;
    }
});
exports.default = init;
