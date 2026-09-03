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
                name: "whitelist-channel",
                description: "Removes a channel from blacklist to allow interactions",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "channel",
                        description: "channel to unblock",
                        type: discord_js_1.ApplicationCommandOptionType.Channel,
                        channel_types: [discord_js_1.ChannelType.GuildText],
                    },
                ],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    // get the channel from options
                    const ans_channel = interaction.options.getChannel("channel");
                    const guild_id = interaction.guildId;
                    if (!guild_id || !ans_channel) {
                        yield interaction.editReply({
                            content: "⚠️ Invalid command. Please check your input and try again.",
                        });
                        return;
                    }
                    const guildConfig = yield configSchema_1.default.findOne({ serverID: guild_id });
                    if (!guildConfig) {
                        yield interaction.editReply("🔍 This server could not be identified. Check if the bot has access.");
                        return;
                    }
                    let blacklistedChannels = guildConfig.levelConfig.blacklistedChannels;
                    if (!blacklistedChannels.includes(ans_channel.id)) {
                        yield interaction.editReply("⚠️ Channel is not blacklisted.");
                        return;
                    }
                    blacklistedChannels = blacklistedChannels.filter((channel) => channel !== ans_channel.id);
                    guildConfig.levelConfig.blacklistedChannels = blacklistedChannels;
                    yield guildConfig.save();
                    yield interaction.editReply(`✅ Removed <#${ans_channel.id}> from blacklist.`);
                }
                catch (err) {
                    console.error("Error in whitelist-channel subcommand callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in whitelist-channel subcommand : ", err);
        return undefined;
    }
});
exports.default = init;
