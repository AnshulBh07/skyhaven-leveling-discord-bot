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
const guildQuestsSchema_1 = __importDefault(require("../../../../models/guildQuestsSchema"));
const permissionsCheck_1 = require("../../../../utils/permissionsCheck");
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "delete",
                description: "Delete a created guild quest submission",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "gquest_id",
                        description: "ID of gquest to be deleted.",
                        type: discord_js_1.ApplicationCommandOptionType.String,
                        required: true,
                    },
                ],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const guild = interaction.guild;
                    const gquest_id = interaction.options.getString("gquest_id");
                    if (!gquest_id || !guild) {
                        yield interaction.editReply({
                            content: "⚠️ Invalid command. Please check your input and try again.",
                        });
                        return;
                    }
                    const gquest = yield guildQuestsSchema_1.default.findOne({
                        serverID: guild.id,
                        messageID: gquest_id,
                    });
                    if (!gquest) {
                        yield interaction.editReply({
                            content: "🚫 Guild quest not found. Please ensure the provided ID is correct.",
                        });
                        return;
                    }
                    const { status, channelID, messageID } = gquest;
                    if (status !== "pending") {
                        yield interaction.editReply({
                            content: "⚠️ You cannot delete a gquest submission that has already been completed.",
                        });
                        return;
                    }
                    const guildConfig = yield configSchema_1.default.findOne({ serverID: guild.id });
                    if (!guildConfig) {
                        yield interaction.editReply("🔍 This server could not be identified. Check if the bot has access.");
                        return;
                    }
                    const isAdmin = yield (0, permissionsCheck_1.isManager)(client, interaction.user.id, guild.id, "mz");
                    if (interaction.user.id !== gquest.userID && !isAdmin) {
                        yield interaction.editReply({
                            content: "🚫 You do not have permission to perform this action.",
                        });
                        return;
                    }
                    const channel = yield guild.channels.fetch(channelID, {
                        force: true,
                    });
                    if (!channel || channel.type !== discord_js_1.ChannelType.GuildText) {
                        yield interaction.editReply({
                            content: "🚫 Invalid guild quest channel specified.",
                        });
                        return;
                    }
                    const gquestMessage = yield channel.messages.fetch(messageID);
                    //   delete message
                    yield gquestMessage.delete();
                    //   delete from db too
                    yield guildQuestsSchema_1.default.deleteOne({
                        messageID: gquest_id,
                        serverID: guild.id,
                    });
                    interaction.editReply({
                        content: "✅ Guild Quest deleted successfully.",
                    });
                }
                catch (err) {
                    console.error("Error in delete gquest subcommand callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in gquest delete command : ", err);
        return undefined;
    }
});
exports.default = init;
