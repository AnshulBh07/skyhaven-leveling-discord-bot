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
const guildQuestsSchema_1 = __importDefault(require("../../../../models/guildQuestsSchema"));
const gquestUtils_1 = require("../../../../utils/gquestUtils");
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "pending",
                description: "Gives list of all pending guild quests. If user is specified gives details for the user only",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "user",
                        description: "target user",
                        type: discord_js_1.ApplicationCommandOptionType.User,
                        required: false,
                    },
                ],
            },
            // if user is not specified give all pending, otherwise only for that user
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const targetUser = interaction.options.getUser("user");
                    const guild = interaction.guild;
                    const channel = interaction.channel;
                    if (!guild || !channel || channel.type !== discord_js_1.ChannelType.GuildText) {
                        yield interaction.editReply({
                            content: `⚠️ Invalid command. Please check your input and try again.`,
                        });
                        return;
                    }
                    //   fetch all pending gquests
                    let gquests = yield guildQuestsSchema_1.default.find({
                        serverID: guild.id,
                        status: "pending",
                    });
                    let title = "📃 List of Pending Guild Quests";
                    if (targetUser) {
                        gquests = gquests.filter((gquest) => gquest.userID === targetUser.id);
                        title = `📃 List of Pending Guild Quests for${targetUser ? targetUser.displayName : ""}`;
                    }
                    //   create embed with buttons
                    yield (0, gquestUtils_1.generateGquestsListEmbed)(client, interaction, gquests, title, targetUser ? targetUser.id : "", "pending", "gquest");
                }
                catch (err) {
                    console.error("Error in pending subcommand callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in gquest pending subcommand : ", err);
        return undefined;
    }
});
exports.default = init;
