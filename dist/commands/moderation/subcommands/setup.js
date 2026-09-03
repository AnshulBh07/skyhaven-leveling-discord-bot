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
const configSchema_1 = __importDefault(require("../../../models/configSchema"));
const configurationCheck_1 = require("../../../utils/configurationCheck");
const commonUtils_1 = require("../../../utils/commonUtils");
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "setup",
                description: "Check and guide through the full server configuration setup.",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const guild = interaction.guild;
                    if (!guild) {
                        yield interaction.editReply({
                            content: "⚠️ Invalid command. Please check your input and try again.",
                        });
                        return;
                    }
                    const config = yield configSchema_1.default.findOne({ serverID: guild.id });
                    if (!config) {
                        yield interaction.editReply("🔍 This server could not be identified. Check if the bot has access.");
                        return;
                    }
                    const isReady = (0, configurationCheck_1.guildConfigCheck)(config);
                    const missing = {
                        Leveling: [],
                        Moderation: [],
                        Giveaway: [],
                        Guild_Quest: [],
                        Guild_Maze: [],
                        Raids: [],
                    };
                    // Leveling Config
                    if (!config.levelConfig.notificationChannelID)
                        missing.Leveling.push("`/lvl channel`");
                    if (!config.levelConfig.managerRoles.length)
                        missing.Leveling.push("`/lvl add-admin`");
                    // Moderation Config
                    if (!config.moderationConfig.welcomeChannelID)
                        missing.Moderation.push("`/mod welcome-channel`");
                    if (!config.moderationConfig.farewellChannelID)
                        missing.Moderation.push("`/mod farewell-channel`");
                    if (!config.moderationConfig.botAdminIDs.length)
                        missing.Moderation.push("`/mod add-admin`");
                    // Giveaway Config
                    if (!config.giveawayConfig.giveawayChannelID)
                        missing.Giveaway.push("`/ga channel`");
                    if (!config.giveawayConfig.giveawayRole)
                        missing.Giveaway.push("`/ga use-role`");
                    if (!config.giveawayConfig.managerRoles.length)
                        missing.Giveaway.push("`/ga add-admin`");
                    // GQuest / Maze Config
                    if (!config.gquestMazeConfig.gquestChannelID)
                        missing.Guild_Quest.push("`/gq channel`");
                    if (!config.gquestMazeConfig.gquestRole)
                        missing.Guild_Quest.push("`/gq use-role`");
                    if (!config.gquestMazeConfig.gquestRewardAmount)
                        missing.Guild_Quest.push("`/gq reward-amount`");
                    if (!config.gquestMazeConfig.managerRoles.length)
                        missing.Guild_Quest.push("`/gq add-admin`");
                    if (!config.gquestMazeConfig.mazeChannelID)
                        missing.Guild_Maze.push("`/mz channel`");
                    if (!config.gquestMazeConfig.mazeRole)
                        missing.Guild_Maze.push("`/mz use-role`");
                    if (!config.gquestMazeConfig.mazeRewardAmount)
                        missing.Guild_Maze.push("`/mz reward-amount`");
                    // Raid Config
                    if (!config.raidConfig.raidChannelID)
                        missing.Raids.push("`/raid channel`");
                    if (!config.raidConfig.raidRole)
                        missing.Raids.push("`/raid use-role`");
                    if (!config.raidConfig.managerRoles.length)
                        missing.Raids.push("`/raid add-admin`");
                    if (!config.raidConfig.tankEmojiID)
                        missing.Raids.push("`/raid tank_emoji`");
                    if (!config.raidConfig.dpsEmojiID)
                        missing.Raids.push("`/raid dps_emoji`");
                    if (!config.raidConfig.supportEmojiID)
                        missing.Raids.push("`/raid support_emoji`");
                    const thumbnail = (0, commonUtils_1.getThumbnail)();
                    // --- Embed Construction ---
                    const embed = new discord_js_1.EmbedBuilder()
                        .setTitle("🛠️ Server Setup Checklist")
                        .setColor(isReady ? "Green" : "Orange")
                        .setDescription(isReady
                        ? "✅ All essential systems are configured.\nYou can still review settings if needed."
                        : "⚠️ The following required settings are missing. Run the listed commands to complete setup:")
                        .setFooter({
                        text: `${guild.name} Configuration`,
                        iconURL: "attachment://thumbnail.png",
                    })
                        .setTimestamp();
                    for (const [section, commands] of Object.entries(missing)) {
                        if (commands.length > 0) {
                            embed.addFields({
                                name: `__${section.split("_").join(" ")}__`,
                                value: commands.join("\n"),
                                inline: false,
                            });
                        }
                    }
                    yield interaction.editReply({ embeds: [embed], files: [thumbnail] });
                }
                catch (err) {
                    console.error("Error in mod setup subcommand callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in mod setup subcommand : ", err);
        return undefined;
    }
});
exports.default = init;
