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
const configSchema_1 = __importDefault(require("../../../../models/configSchema"));
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "view",
                description: "View XP config for current server",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                try {
                    const guildId = (_a = interaction.guildId) !== null && _a !== void 0 ? _a : "";
                    const config = yield configSchema_1.default.findOne({ serverID: guildId });
                    const levelConfig = config === null || config === void 0 ? void 0 : config.levelConfig;
                    if (!config || !levelConfig) {
                        yield interaction.editReply("⚠️ No configuration found for this server");
                        return;
                    }
                    const embed = new discord_js_1.EmbedBuilder()
                        .setTitle("🔧 Server Configuration")
                        .setColor("Blurple")
                        .addFields({
                        name: "🪪 Server ID",
                        value: config.serverID,
                        inline: true,
                    }, {
                        name: "🤖 Bot ID",
                        value: config.botID || "Not set",
                        inline: true,
                    }, {
                        name: "📢 Notification Channel",
                        value: levelConfig.notificationChannelID
                            ? `<#${levelConfig.notificationChannelID}>`
                            : "Not set",
                        inline: true,
                    }, {
                        name: "🚫 Blacklisted Channels",
                        value: levelConfig.blacklistedChannels.length
                            ? levelConfig.blacklistedChannels
                                .map((id) => `<#${id}>`)
                                .join(", ")
                            : "None",
                    }, {
                        name: "🙈 Ignored Channels",
                        value: levelConfig.ignoredChannels.length
                            ? levelConfig.ignoredChannels
                                .map((id) => `<#${id}>`)
                                .join(", ")
                            : "None",
                    }, {
                        name: "⏱ XP Cooldown",
                        value: `${levelConfig.xpCooldown}ms`,
                        inline: true,
                    }, {
                        name: "📈 XP Sources",
                        value: [
                            levelConfig.xpFromText && "Text",
                            levelConfig.xpFromEmojis && "Emojis",
                            levelConfig.xpFromReactions && "Reactions",
                            levelConfig.xpFromAttachments && "Attachments",
                            levelConfig.xpFromEmbeds && "Embeds",
                            levelConfig.xpFromStickers && "Stickers",
                        ]
                            .filter(Boolean)
                            .join(", ") || "None",
                    }, {
                        name: "🎖️ Level Roles",
                        value: levelConfig.levelRoles.length
                            ? levelConfig.levelRoles
                                .map((role) => `• <@&${role.roleID}>: Lv. ${role.minLevel} - ${role.maxLevel}`)
                                .join("\n")
                            : "None",
                    })
                        .setFooter({
                        text: "Use /lvl set to modify these settings.",
                    });
                    yield interaction.editReply({ embeds: [embed] });
                }
                catch (err) {
                    console.error(err);
                }
            }),
        };
    }
    catch (err) {
        console.error(err);
        return undefined;
    }
});
exports.default = init;
