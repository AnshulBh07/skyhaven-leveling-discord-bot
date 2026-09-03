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
                name: "participation-role",
                description: "Sets role assigned to participants",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [{
                        name: "role",
                        description: "role to set",
                        type: discord_js_1.ApplicationCommandOptionType.Role,
                        required: true
                    }]
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const role = interaction.options.getRole("role");
                    const guild = interaction.guild;
                    if (!role || !guild) {
                        yield interaction.editReply({
                            content: "⚠️ Invalid command. Please check your input and try again.",
                        });
                        return;
                    }
                    const updatedConfig = yield configSchema_1.default.findOneAndUpdate({
                        serverID: guild.id,
                    }, { $set: { "raidConfig.participantRole": role.id } });
                    if (!updatedConfig) {
                        yield interaction.editReply("🔍 This server could not be identified. Check if the bot has access.");
                        return;
                    }
                    yield interaction.editReply({
                        content: `✅ Guild raid participant role set to <@&${role.id}>`,
                    });
                }
                catch (err) {
                    console.error("Error in participation role subcommand callback : ", err);
                    return;
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in raid participiation role set-up command : ", err);
        return undefined;
    }
});
exports.default = init;
