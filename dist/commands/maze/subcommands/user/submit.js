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
const userSchema_1 = __importDefault(require("../../../../models/userSchema"));
const mazeSchema_1 = __importDefault(require("../../../../models/mazeSchema"));
const mazeUtils_1 = require("../../../../utils/mazeUtils");
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "submit",
                description: "Submit a maze for yourself or some other user.",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "start_floor",
                        description: "floor from",
                        type: discord_js_1.ApplicationCommandOptionType.Number,
                        min_value: 1,
                        max_value: 900,
                        required: true,
                    },
                    {
                        name: "end_floor",
                        description: "floor to",
                        type: discord_js_1.ApplicationCommandOptionType.Number,
                        min_value: 100,
                        max_value: 1000,
                        required: true,
                    },
                    {
                        name: "user",
                        description: "target user",
                        type: discord_js_1.ApplicationCommandOptionType.User,
                    },
                ],
            },
            // there will be a followup message the will account for submissions, user will send images
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                try {
                    const targetUser = (_a = interaction.options.getUser("user")) !== null && _a !== void 0 ? _a : interaction.user;
                    const start_floor = interaction.options.getNumber("start_floor");
                    const end_floor = interaction.options.getNumber("end_floor");
                    const channel = interaction.channel;
                    const guild = interaction.guild;
                    if (!start_floor ||
                        !end_floor ||
                        !targetUser ||
                        !channel ||
                        !guild ||
                        start_floor >= end_floor) {
                        yield interaction.editReply({
                            content: "⚠️ Invalid command. Please check your input and try again.",
                        });
                        return;
                    }
                    if (channel.type !== discord_js_1.ChannelType.GuildText) {
                        yield interaction.editReply({
                            content: "Channel is not text-based.",
                        });
                        return;
                    }
                    // find user
                    const user = yield userSchema_1.default.findOne({
                        userID: targetUser.id,
                    });
                    if (!user) {
                        yield interaction.editReply({ content: "User not found." });
                        return;
                    }
                    yield interaction.editReply({
                        content: "Maze submission process has started. You will need to provide image proof for every 100th floor you've cleard.",
                    });
                    const reply = yield interaction.fetchReply();
                    // the rest of the submission will be handled in an isaloted environment only
                    // meant for user, yes we will do it in a thread and attach a collector to it
                    const submissionThread = yield channel.threads.create({
                        name: `${targetUser.username} - Maze Images submissions`,
                        autoArchiveDuration: 60,
                    });
                    // create a new empty maze, we will keep updating it
                    const mazeOptions = {
                        userID: targetUser.id,
                        serverID: guild.id,
                        messageID: reply.id,
                        embedMessageID: reply.id,
                        channelID: channel.id,
                        submissionThreadID: submissionThread.id,
                        imageUrls: [],
                        startFloor: start_floor,
                        endFloor: end_floor,
                        imageHash: "dummy hash",
                        status: "pending",
                        submittedAt: Date.now(),
                        reviewedBy: "dummy admin",
                    };
                    const newMaze = new mazeSchema_1.default(mazeOptions);
                    yield newMaze.save();
                    const subNeeded = Math.round((end_floor - start_floor) / 100);
                    yield submissionThread.send({
                        content: `⚠️ Please submit exactly ${subNeeded} image(s) as proof — one for every 100 floors completed.`,
                    });
                    yield (0, mazeUtils_1.attachMazeThreadCollector)(client, submissionThread.id);
                }
                catch (err) {
                    console.error("Error in maze submit subcommand callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in maze submit subcommand :", err);
        return undefined;
    }
});
exports.default = init;
