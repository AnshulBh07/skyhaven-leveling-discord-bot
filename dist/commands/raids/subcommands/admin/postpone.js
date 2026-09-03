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
const configSchema_1 = __importDefault(require("../../../../models/configSchema"));
const raidUtils_1 = require("../../../../utils/raidUtils");
const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];
const daysMapped = days.map((day, idx) => ({ name: day, value: idx }));
const daysOption = {
    name: "day",
    description: "Day of the week.",
    type: discord_js_1.ApplicationCommandOptionType.Number,
    required: false,
    choices: daysMapped,
};
const timeOption = {
    name: "time",
    description: "Time of the day. (eg. 20:30, in JST)",
    type: discord_js_1.ApplicationCommandOptionType.String,
    required: false,
};
// postpone a raid, there are no restrictions here assuming admins follow a proper flow
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "postpone",
                description: "Postpone a raid.",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "raid_id",
                        description: "ID of raid to be postponed. (Cannot postpone completed raids)",
                        type: discord_js_1.ApplicationCommandOptionType.String,
                        required: true,
                    },
                    daysOption,
                    timeOption,
                ],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                try {
                    const guild = interaction.guild;
                    const raid_id = interaction.options.getString("raid_id");
                    const day = interaction.options.getNumber("day");
                    const time = interaction.options.getString("time");
                    const channel = interaction.channel;
                    if (!guild ||
                        !raid_id ||
                        !day ||
                        !time ||
                        !channel ||
                        channel.type !== 0) {
                        yield interaction.editReply({
                            content: "⚠️ Invalid command. Please check your input and try again.",
                        });
                        return;
                    }
                    const guildConfig = yield configSchema_1.default.findOne({ serverID: guild.id });
                    if (!guildConfig) {
                        yield interaction.editReply("🔍 This server could not be identified. Check if the bot has access.");
                        return;
                    }
                    const raid = yield raidSchema_1.default.findOne({
                        serverID: guild.id,
                        announcementMessageID: raid_id,
                    });
                    if (!raid) {
                        yield interaction.editReply({ content: "No raid found." });
                        return;
                    }
                    if ((_a = raid.raidTimestamps) === null || _a === void 0 ? void 0 : _a.completedTime) {
                        yield interaction.editReply({
                            content: "Cannot postpone a raid that has been completed already.",
                        });
                        return;
                    }
                    //   check if the new time is valid
                    const newStartTime = (0, raidUtils_1.getRelativeDiscordTime)(day + 1, time);
                    if (raid.raidTimestamps &&
                        raid.raidTimestamps.startTime > newStartTime * 1000) {
                        yield interaction.editReply({
                            content: "Invalid time. Please provide a valid input.",
                        });
                        return;
                    }
                    const { raidChannelID, raidRole } = guildConfig.raidConfig;
                    const link = `https://discord.com/channels/${guild.id}/${raidChannelID}/${raid.announcementMessageID}`;
                    const LinkButton = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                        .setStyle(discord_js_1.ButtonStyle.Link)
                        .setLabel("Jump to Raid.")
                        .setURL(link));
                    yield channel.send({
                        content: `<@&${raidRole}>\n The follwoing raid has been postponed to <t:${newStartTime}:F>`,
                        components: [LinkButton],
                    });
                    //   also save in db
                    if (raid.raidTimestamps) {
                        raid.raidTimestamps.startTime = newStartTime * 1000;
                        yield raid.save();
                    }
                    yield interaction.editReply({
                        content: "Raid postponed succesfully.",
                    });
                }
                catch (err) {
                    console.error("Error in raid postpone subcommand callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in raid postpone subcommand : ", err);
        return undefined;
    }
});
exports.default = init;
