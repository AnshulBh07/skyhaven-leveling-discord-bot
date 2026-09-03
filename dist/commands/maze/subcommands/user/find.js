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
const mazeSchema_1 = __importDefault(require("../../../../models/mazeSchema"));
// gives the link to gquest submission message if u have the gquest id
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "find",
                description: "Find guild maze submission with gquest id.",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "maze_id",
                        description: "ID of guild maze",
                        type: discord_js_1.ApplicationCommandOptionType.String,
                        required: true,
                    },
                ],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const guild = interaction.guild;
                    const message_id = interaction.options.getString("maze_id");
                    if (!message_id || !guild) {
                        yield interaction.editReply({
                            content: "⚠️ Invalid command. Please check your input and try again.",
                        });
                        return;
                    }
                    //   find the gquest
                    const maze = yield mazeSchema_1.default.findOne({
                        embedMessageID: message_id,
                        type: "maze",
                    });
                    if (!maze) {
                        yield interaction.editReply({ content: "No guild maze found." });
                        return;
                    }
                    const messageLink = `https://discord.com/channels/${guild.id}/${maze.channelID}/${maze.messageID}`;
                    const LinkButton = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                        .setLabel("Jump to message")
                        .setURL(messageLink)
                        .setStyle(discord_js_1.ButtonStyle.Link));
                    yield interaction.editReply({ components: [LinkButton] });
                }
                catch (err) {
                    console.error("Error in gquest find subcommand callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in gquest find subcommand : ", err);
        return undefined;
    }
});
exports.default = init;
