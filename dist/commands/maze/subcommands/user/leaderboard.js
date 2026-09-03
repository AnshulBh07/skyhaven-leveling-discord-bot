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
const gquestUtils_1 = require("../../../../utils/gquestUtils");
const userSchema_1 = __importDefault(require("../../../../models/userSchema"));
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "leaderboard",
                description: "List of top guild quest contributors",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const guild = interaction.guild;
                    const channel = interaction.channel;
                    if (!guild || !channel || channel.type !== discord_js_1.ChannelType.GuildText) {
                        yield interaction.editReply({
                            content: "⚠️ Invalid command. Please check your input and try again.",
                        });
                        return;
                    }
                    //   make leaderboard with lean and projection
                    const users = (yield userSchema_1.default.find({ serverID: guild.id }, { userID: 1, mazes: 1 }).lean());
                    yield (0, gquestUtils_1.getGquestMazeLeaderboard)(client, users, guild, "maze", interaction, channel);
                }
                catch (err) {
                    console.error("Error in maze leaderboard callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in maze leaderboard subcommand : ", err);
        return undefined;
    }
});
exports.default = init;
