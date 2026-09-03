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
const mazeSchema_1 = __importDefault(require("../../../../models/mazeSchema"));
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "pending",
                description: "Gives list of all pending guild mazes. If user is specified gives details for the user only",
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
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const targetUser = interaction.options.getUser("user");
                    const guild = interaction.guild;
                    if (!guild) {
                        yield interaction.editReply({
                            content: "⚠️ Invalid command. Please check your input and try again.",
                        });
                        return;
                    }
                    //   fetch all pending gquests
                    let mazes = yield mazeSchema_1.default.find({
                        serverID: guild.id,
                        status: "pending",
                    });
                    let title = "📃 List of all Pending Guild Mazes";
                    if (targetUser) {
                        mazes = mazes.filter((maze) => maze.userID === targetUser.id);
                        title = `📃 List of Pending Guild Mazes for ${targetUser ? targetUser.username : ""}`;
                    }
                    //   create embed with buttons
                    yield (0, gquestUtils_1.generateGquestsListEmbed)(client, interaction, mazes, title, targetUser ? targetUser.id : "", "pending", "maze");
                }
                catch (err) {
                    console.error("Error in maze pending subcommand callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in maze pending subcommand : ", err);
        return undefined;
    }
});
exports.default = init;
