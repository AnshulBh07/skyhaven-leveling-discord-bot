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
const helperArrays_1 = require("../../../../data/helperArrays");
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "banlist",
                description: "Displays all users banned from participating in guild raids.",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const guildId = interaction.guildId;
                    if (!guildId) {
                        yield interaction.editReply({
                            content: "⚠️ Invalid command. Please check your input and try again.",
                        });
                        return;
                    }
                    const guildConfig = yield configSchema_1.default.findOne({ serverID: guildId });
                    if (!guildConfig) {
                        yield interaction.editReply("🔍 This server could not be identified. Check if the bot has access.");
                        return;
                    }
                    const { raidConfig } = guildConfig;
                    const { banList } = raidConfig;
                    if (banList.length === 0) {
                        yield interaction.editReply("No users in ban list.");
                        return;
                    }
                    const bannedUsers = banList
                        .map((user, index) => `${index + 1}. <@${user.userID}> - ${user.reason} (${user.banDate.toISOString().split("T")[0]})`)
                        .join("\n");
                    const thumbnail = new discord_js_1.AttachmentBuilder(helperArrays_1.leaderboardThumbnail).setName("thumbnail.png");
                    const bannedEmbed = new discord_js_1.EmbedBuilder()
                        .setTitle("🚫   List of users banned from guild raids")
                        .setColor("DarkAqua")
                        .setDescription(bannedUsers)
                        .setFooter({
                        text: `Total banned users : ${banList.length}`,
                        iconURL: "attachment://thumbnail.png",
                    });
                    yield interaction.editReply({
                        embeds: [bannedEmbed],
                        files: [thumbnail],
                    });
                }
                catch (err) {
                    console.error("Error in raid banlist callback", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in raid banlist command", err);
        return undefined;
    }
});
exports.default = init;
