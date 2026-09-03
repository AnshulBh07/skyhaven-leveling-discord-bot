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
                name: "channel",
                description: "Sets channel for communtiy support.",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "channel",
                        description: "target channel",
                        type: discord_js_1.ApplicationCommandOptionType.Channel,
                        channel_types: [discord_js_1.ChannelType.GuildText],
                        required: true,
                    },
                ],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const channel = interaction.options.getChannel("channel");
                    const guildID = interaction.guildId;
                    if (!channel || channel.type !== 0 || !guildID) {
                        yield interaction.editReply({
                            content: `⚠️ Invalid command. Please check your input and try again.`,
                        });
                        return;
                    }
                    const guildConfig = yield configSchema_1.default.findOne({ serverID: guildID });
                    if (!guildConfig) {
                        yield interaction.editReply({
                            content: "🔍 This server could not be identified. Check if the bot has access.",
                        });
                        return;
                    }
                    guildConfig.communitySupportConfig.supportChannelID = channel.id;
                    yield guildConfig.save();
                    yield interaction.editReply({
                        content: `📢 Community support channel updated to: ${channel}`,
                    });
                }
                catch (err) {
                    console.error("Error in community-support channel callback", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in community-support channel command", err);
        return undefined;
    }
});
exports.default = init;
