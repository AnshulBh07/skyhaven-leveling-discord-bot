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
const configSchema_1 = __importDefault(require("../../../models/configSchema"));
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "remove-admin",
                description: "Revoke a user from bot management.",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "user",
                        description: "target user",
                        type: discord_js_1.ApplicationCommandOptionType.User,
                        required: true,
                    },
                ],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const user = interaction.options.getUser("user");
                    const guild = interaction.guild;
                    if (!user || !guild) {
                        yield interaction.editReply({
                            content: "⚠️ Invalid command. Please check your input and try again.",
                        });
                        return;
                    }
                    const config = yield configSchema_1.default.findOne({ serverID: guild.id });
                    if (!config) {
                        yield interaction.editReply("🔍 This server could not be identified. Check if the bot has access.");
                        return;
                    }
                    const { botAdminIDs } = config.moderationConfig;
                    if (!botAdminIDs.includes(user.id)) {
                        yield interaction.editReply("⚠️ This user is not set as bot admin.");
                        return;
                    }
                    config.moderationConfig.botAdminIDs =
                        config.moderationConfig.botAdminIDs.filter((admin) => admin !== user.id);
                    yield config.save();
                    yield interaction.editReply({
                        content: `✅ Revoked <@${user.id}> as an admin for bot.`,
                    });
                }
                catch (err) {
                    console.error("Error in mod remove-admin callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in mod remove-admin subcommand : ", err);
        return undefined;
    }
});
exports.default = init;
