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
                name: "ban",
                description: "Bans a user from participating in giveaways.",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "user",
                        description: "user to ban",
                        type: discord_js_1.ApplicationCommandOptionType.User,
                        required: true,
                    },
                    {
                        name: "reason",
                        description: "reason for ban",
                        type: discord_js_1.ApplicationCommandOptionType.String,
                        required: true,
                    },
                ],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                try {
                    const targetUser = interaction.options.getUser("user");
                    const reason = (_a = interaction.options.getString("reason")) !== null && _a !== void 0 ? _a : "";
                    const guildID = interaction.guildId;
                    if (!targetUser || !guildID || targetUser.bot) {
                        yield interaction.editReply({
                            content: "⚠️ Invalid command. Please check your input and try again.",
                        });
                        return;
                    }
                    //   get banlist and see if the user is already banned
                    const guildConfig = yield configSchema_1.default.findOne({ serverID: guildID });
                    if (!guildConfig) {
                        yield interaction.editReply("🔍 This server could not be identified. Check if the bot has access.");
                        return;
                    }
                    const { giveawayConfig } = guildConfig;
                    const banList = giveawayConfig.banList;
                    const isBanned = banList.some((user) => user.userID === targetUser.id);
                    if (isBanned) {
                        yield interaction.editReply(`⚠️ <@${targetUser.id}> is already banned from giveaways.`);
                        return;
                    }
                    giveawayConfig.banList.push({
                        userID: targetUser.id,
                        reason: reason,
                        banDate: new Date(),
                        banBy: interaction.user.id,
                    });
                    yield guildConfig.save();
                    yield interaction.editReply({
                        content: `🚫 <@${targetUser.id}> has been banned from participating in any further giveaways.\nUse \`/ga unban\` to remove them from the ban list at any time.`,
                    });
                }
                catch (err) {
                    console.error("Error in giveaway ban command callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in giveaway ban command : ", err);
        return undefined;
    }
});
exports.default = init;
