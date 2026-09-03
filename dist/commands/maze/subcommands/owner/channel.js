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
                description: "Channel where guild members submit guild mazes and all related notfications are sent.",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "channel",
                        description: "channel to set",
                        type: discord_js_1.ApplicationCommandOptionType.Channel,
                        channelTypes: [discord_js_1.ChannelType.GuildText],
                        required: true,
                    },
                ],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const channel = interaction.options.getChannel("channel");
                    const guild = interaction.guild;
                    if (!channel || !guild) {
                        yield interaction.editReply({
                            content: "⚠️ Invalid command. Please check your input and try again.",
                        });
                        return;
                    }
                    const updatedConfig = yield configSchema_1.default.findOneAndUpdate({
                        serverID: guild.id,
                    }, { $set: { "gquestMazeConfig.mazeChannelID": channel.id } });
                    if (!updatedConfig) {
                        yield interaction.editReply("🔍 This server could not be identified. Check if the bot has access.");
                        return;
                    }
                    yield interaction.editReply({
                        content: `✅ The guild maze channel has been successfully set to <#${channel.id}>.`,
                    });
                }
                catch (err) {
                    console.error("Error in maze channel callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in maze channel subcommand : ", err);
        return undefined;
    }
});
exports.default = init;
