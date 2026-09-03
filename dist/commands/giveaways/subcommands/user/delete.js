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
const giveawaySchema_1 = __importDefault(require("../../../../models/giveawaySchema"));
const configSchema_1 = __importDefault(require("../../../../models/configSchema"));
const permissionsCheck_1 = require("../../../../utils/permissionsCheck");
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "delete",
                description: "Deletes a giveaway based on it's ID.",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "giveaway_id",
                        description: "id of giveaway you want to delete. (Can be found on giveaway creation message)",
                        type: discord_js_1.ApplicationCommandOptionType.String,
                        required: true,
                    },
                ],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const giveaway_id = interaction.options.getString("giveaway_id");
                    const guildID = interaction.guildId;
                    if (!giveaway_id || !guildID) {
                        yield interaction.editReply({
                            content: `⚠️ Invalid command. Please check your input and try again.`,
                        });
                        return;
                    }
                    const giveaway = yield giveawaySchema_1.default.findOne({
                        serverID: guildID,
                        messageID: giveaway_id,
                    });
                    if (!giveaway) {
                        yield interaction.editReply({
                            content: "🚫 Giveaway not found. Please ensure the provided ID is correct.",
                        });
                        return;
                    }
                    const { messageID, serverID, channelID, isEnded } = giveaway;
                    if (isEnded) {
                        yield interaction.editReply({
                            content: "⚠️ You cannot delete a giveaway that has already been completed.",
                        });
                        return;
                    }
                    const guildConfig = yield configSchema_1.default.findOne({ serverID: guildID });
                    if (!guildConfig) {
                        yield interaction.editReply("🔍 This server could not be identified. Check if the bot has access.");
                        return;
                    }
                    const isAdmin = yield (0, permissionsCheck_1.isManager)(client, interaction.user.id, guildID, "ga");
                    if (interaction.user.id !== giveaway.hostID && !isAdmin) {
                        yield interaction.editReply({
                            content: "🚫 You do not have permission to perform this action.",
                        });
                        return;
                    }
                    const guild = yield client.guilds.fetch({
                        guild: serverID,
                        force: true,
                    });
                    const channel = yield guild.channels.fetch(channelID, {
                        force: true,
                    });
                    if (!channel || channel.type !== discord_js_1.ChannelType.GuildText) {
                        yield interaction.editReply({
                            content: "🚫 Invalid giveaway channel specified.",
                        });
                        return;
                    }
                    const giveawayMessage = yield channel.messages.fetch(messageID);
                    //   delete message
                    yield giveawayMessage.delete();
                    //   delete from db too
                    yield giveawaySchema_1.default.deleteOne({
                        messageID: giveaway_id,
                        serverID: guildID,
                    });
                    interaction.editReply({
                        content: "✅ Giveaway deleted successfully.",
                    });
                }
                catch (err) {
                    console.error("Error in giveaway delete callback :", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in giveaway delete command", err);
        return undefined;
    }
});
exports.default = init;
