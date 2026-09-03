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
const raidSchema_1 = __importDefault(require("../../../../models/raidSchema"));
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "cancel",
                description: "Cancel a scheduled raid",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "raid_id",
                        description: "ID of raid to cancel",
                        type: discord_js_1.ApplicationCommandOptionType.String,
                        required: true,
                    },
                ],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const guild = interaction.guild;
                    const raid_id = interaction.options.getString("raid_id");
                    if (!guild || !raid_id) {
                        yield interaction.editReply({
                            content: "⚠️ Invalid command. Please check your input and try again.",
                        });
                        return;
                    }
                    const deleted = yield raidSchema_1.default.findOneAndDelete({
                        announcementMessageID: raid_id,
                        serverID: guild.id,
                    });
                    if (!deleted) {
                        yield interaction.editReply({ content: "No raid found." });
                        return;
                    }
                    yield interaction.editReply({
                        content: "Raid has been deleted successfully.",
                    });
                }
                catch (err) {
                    console.error("Error in raid cancel subcommand callabck : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in raid cancel subcommand : ", err);
        return undefined;
    }
});
exports.default = init;
