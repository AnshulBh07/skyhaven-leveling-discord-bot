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
                name: "dps-emoji",
                description: "Set dps role emoji for guild raids.",
                options: [
                    {
                        name: "emoji_id",
                        description: "ID of emoji",
                        type: discord_js_1.ApplicationCommandOptionType.String,
                        required: true,
                    },
                ],
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const emoji_id = interaction.options.getString("emoji_id");
                    const guild = interaction.guild;
                    if (!emoji_id || !guild) {
                        yield interaction.editReply({
                            content: "⚠️ Invalid command. Please check your input and try again.",
                        });
                        return;
                    }
                    //   check if emoji is present in guild or not
                    const emoji = yield guild.emojis.fetch(emoji_id, { force: true });
                    if (!emoji) {
                        yield interaction.editReply({
                            content: "Emoji not found in the server. Please select a different emoji.",
                        });
                        return;
                    }
                    const guildConfig = yield configSchema_1.default.findOne({ serverID: guild.id });
                    if (!guildConfig) {
                        yield interaction.editReply("🔍 This server could not be identified. Check if the bot has access.");
                        return;
                    }
                    const { raidConfig } = guildConfig;
                    raidConfig.dpsEmojiID = emoji.id;
                    yield guildConfig.save();
                    yield interaction.editReply({
                        content: `✅ Set ${emoji} as dps emoji for guild raids.`,
                    });
                }
                catch (err) {
                    console.error("Error in raid dps emoji subcommand callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in raid dps emoji subcommand : ", err);
        return undefined;
    }
});
exports.default = init;
