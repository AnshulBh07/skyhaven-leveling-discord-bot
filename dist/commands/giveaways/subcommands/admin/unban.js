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
                name: "unban",
                description: "Removes a user from giveaways ban list.",
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
                    const targetUser = interaction.options.getUser("user");
                    const guildID = interaction.guildId;
                    if (!targetUser || !guildID || targetUser.bot) {
                        yield interaction.editReply({
                            content: `⚠️ Invalid command. Please check your input and try again.`,
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
                    if (!isBanned) {
                        yield interaction.editReply(`⚠️ <@${targetUser.id}> is not in the giveaways ban list.`);
                        return;
                    }
                    yield configSchema_1.default.findOneAndUpdate({ serverID: guildID }, { $pull: { "giveawayConfig.banList": { userID: targetUser.id } } });
                    yield interaction.editReply(`✅ <@${targetUser.id}> has been removed from the giveaways ban list.`);
                }
                catch (err) {
                    console.error("Error in giveaway unban command callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in giveaway unban command : ", err);
        return undefined;
    }
});
exports.default = init;
