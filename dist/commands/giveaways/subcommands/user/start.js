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
const helperArrays_1 = require("../../../../data/helperArrays");
const ms_1 = __importDefault(require("ms"));
const giveawaySchema_1 = __importDefault(require("../../../../models/giveawaySchema"));
const giveawayUtils_1 = require("../../../../utils/giveawayUtils");
const configSchema_1 = __importDefault(require("../../../../models/configSchema"));
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "start",
                description: "Starts a giveaway.",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "prize",
                        description: "item to giveaway",
                        type: discord_js_1.ApplicationCommandOptionType.String,
                        required: true,
                    },
                    {
                        name: "duration",
                        description: "duration for giveaway. Ex- 1h, 2d, 30m .. etc.",
                        type: discord_js_1.ApplicationCommandOptionType.String,
                        required: true,
                    },
                    {
                        name: "winners",
                        description: "number of winners",
                        type: discord_js_1.ApplicationCommandOptionType.Number,
                        min_value: 1,
                        required: true,
                    },
                    {
                        name: "role",
                        description: "role required to enter giveaway",
                        type: discord_js_1.ApplicationCommandOptionType.Role,
                        required: false,
                    },
                    {
                        name: "host",
                        description: "hosted by",
                        type: discord_js_1.ApplicationCommandOptionType.User,
                        required: false,
                    },
                    {
                        name: "image",
                        description: "screenshot of giveaway item.",
                        type: discord_js_1.ApplicationCommandOptionType.Attachment,
                        required: false,
                    },
                ],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                try {
                    const giveawayItem = interaction.options.getString("prize");
                    const duration = interaction.options.getString("duration");
                    const count_winners = interaction.options.getNumber("winners");
                    const role_req = interaction.options.getRole("role");
                    const itemImage = interaction.options.getAttachment("image");
                    const hosted_by = (_a = interaction.options.getUser("host")) !== null && _a !== void 0 ? _a : interaction.user;
                    const guildID = interaction.guildId;
                    const guild = interaction.guild;
                    // validation
                    if (!giveawayItem ||
                        !duration ||
                        !count_winners ||
                        !guildID ||
                        !hosted_by ||
                        hosted_by.bot ||
                        !guild) {
                        yield interaction.editReply({
                            content: `⚠️ Invalid command. Please check your input and try again.`,
                        });
                        return;
                    }
                    if (giveawayItem.length <= 0) {
                        yield interaction.editReply({
                            content: "🎁 Prize cannot be an empty string.",
                        });
                        return;
                    }
                    const durationMs = (0, ms_1.default)(duration);
                    if (!durationMs || typeof durationMs !== "number") {
                        yield interaction.editReply({
                            content: "Invalid duration format. Use formats like `1h`, `30m`, `2d`, etc.",
                        });
                        return;
                    }
                    if (itemImage &&
                        itemImage.contentType &&
                        !itemImage.contentType.startsWith("image")) {
                        yield interaction.editReply({
                            content: "🖼️ Please provide a valid image.",
                        });
                        return;
                    }
                    const guildConfig = yield configSchema_1.default.findOne({ serverID: guildID });
                    if (!guildConfig) {
                        yield interaction.editReply("🔍 This server could not be identified. Check if the bot has access.");
                        return;
                    }
                    const { giveawayChannelID } = guildConfig.giveawayConfig;
                    // find channel
                    const channel = yield guild.channels.fetch(giveawayChannelID, {
                        force: true,
                    });
                    if (!channel || channel.type !== discord_js_1.ChannelType.GuildText) {
                        yield interaction.editReply({
                            content: "⚠️ Invalid giveaway channel please set up a valid one.",
                        });
                        return;
                    }
                    const startMessage = helperArrays_1.giveawayStartMessages[Math.floor(Math.random() * helperArrays_1.giveawayStartMessages.length)];
                    const endTime = Date.now() + durationMs;
                    const giveawayEmbed = new discord_js_1.EmbedBuilder()
                        .setTitle(`🎁 GIVEAWAY - ${giveawayItem}\n\n`)
                        .setColor(role_req ? role_req.color : "Aqua")
                        .setDescription(startMessage)
                        .addFields({
                        name: "\u200b",
                        value: `**👤 Hosted by : ** <@${hosted_by.id}>`,
                        inline: true,
                    }, {
                        name: "\u200b",
                        value: `**🎊 Winners : ** ${count_winners}`,
                        inline: true,
                    }, {
                        name: "\u200b",
                        value: `**⏱️ Ends : ** <t:${Math.floor(endTime / 1000)}:R>  *(<t:${Math.floor(endTime / 1000)}:f>)*`,
                        inline: false,
                    }, {
                        name: "\u200b",
                        value: `**Entries : ** ${0} `,
                        inline: false,
                    }, ...(role_req
                        ? [
                            {
                                name: "\u200b",
                                value: `**🎯 Required Role : ** <@&${role_req.id}>`,
                                inline: true,
                            },
                        ]
                        : []))
                        .setFooter({
                        text: `Press 🎉 to participate.\nPress 🏃‍♂️ to leave.\n${guild.name} Giveaways`,
                    })
                        .setTimestamp();
                    if (itemImage)
                        giveawayEmbed.setImage(itemImage.url);
                    //   add a button for participation
                    const buttonRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                        .setCustomId("participate")
                        .setEmoji("🎉")
                        .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
                        .setCustomId("leave")
                        .setEmoji("🏃‍♂️")
                        .setStyle(discord_js_1.ButtonStyle.Danger));
                    yield interaction.editReply({
                        content: "Creating your giveaway. Please wait...",
                    });
                    const giveawayMessage = yield channel.send({
                        content: role_req ? `${role_req}` : "",
                        embeds: [giveawayEmbed],
                        files: [],
                        allowedMentions: { roles: role_req ? [role_req.id] : [] },
                        components: [buttonRow],
                    });
                    // now save giveaway data in mongodb
                    const giveawayData = {
                        serverID: guildID,
                        hostID: hosted_by.id,
                        messageID: giveawayMessage.id,
                        channelID: channel.id,
                        endMessageID: "dummy id",
                        prize: giveawayItem,
                        winnersCount: count_winners,
                        participants: [], //collector will keep updating it
                        winners: [],
                        imageUrl: itemImage ? itemImage.url : "",
                        role_req: role_req ? role_req.id : "",
                        role_color: role_req ? role_req.hexColor : "Aqua",
                        starterMessage: startMessage,
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        endsAt: endTime,
                        isEnded: false,
                        isPaused: false,
                    };
                    const newGiveaway = new giveawaySchema_1.default(giveawayData);
                    yield newGiveaway.save();
                    const collector = yield (0, giveawayUtils_1.attachCollector)(client, newGiveaway);
                    // now set a timer
                    if (collector)
                        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                            collector.stop();
                            // to avoid fetching stale state from db fetch a fresh one
                            const freshGiveaway = yield giveawaySchema_1.default.findOne({
                                messageID: newGiveaway.messageID,
                                serverID: guildID,
                            });
                            if (!freshGiveaway)
                                return;
                            yield (0, giveawayUtils_1.endGiveaway)(client, freshGiveaway.messageID);
                        }), endTime - Date.now());
                }
                catch (err) {
                    console.error("Error in giveaway start callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in giveaway start command : ", err);
        return undefined;
    }
});
exports.default = init;
