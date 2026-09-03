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
const userSchema_1 = __importDefault(require("../../../../models/userSchema"));
const guildQuestsSchema_1 = __importDefault(require("../../../../models/guildQuestsSchema"));
const gquestUtils_1 = require("../../../../utils/gquestUtils");
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "submit",
                description: "Submit a guild quest for yourself or some other user",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "count",
                        description: "Number of guild quests completed.",
                        type: discord_js_1.ApplicationCommandOptionType.Number,
                        min_value: 5,
                        required: true,
                    },
                    {
                        name: "image",
                        description: "Ingame screenshot. Without this your submission will be rejected.",
                        type: discord_js_1.ApplicationCommandOptionType.Attachment,
                        required: true,
                    },
                    {
                        name: "user",
                        description: "target user",
                        type: discord_js_1.ApplicationCommandOptionType.User,
                    },
                ],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const targetUser = interaction.options.getUser("user");
                    const gquestImage = interaction.options.getAttachment("image");
                    const count = interaction.options.getNumber("count");
                    const channel = interaction.channel;
                    const guild = interaction.guild;
                    if (!gquestImage ||
                        !channel ||
                        channel.type !== discord_js_1.ChannelType.GuildText ||
                        !guild ||
                        !count) {
                        yield interaction.editReply({
                            content: `⚠️ Invalid command. Please check your input and try again.`,
                        });
                        return;
                    }
                    // find user
                    const user = yield userSchema_1.default.findOne({
                        userID: targetUser ? targetUser.id : interaction.user.id,
                    });
                    if (!user) {
                        yield interaction.editReply({ content: "User not found." });
                        return;
                    }
                    const { gquests } = user;
                    const thumbnail = new discord_js_1.AttachmentBuilder(helperArrays_1.leaderboardThumbnail).setName("thumbnail.png");
                    const submissionImage = new discord_js_1.AttachmentBuilder(gquestImage.url).setName("submitted_image.png");
                    const submissionEmbed = new discord_js_1.EmbedBuilder()
                        .setTitle("🧾 Guild Quest Submission")
                        .setDescription(`Thank you for your submission! 🔍\n` +
                        `Our team will review it shortly. If everything checks out, you’ll be rewarded soon. 🎉`)
                        .setColor("Aqua")
                        .addFields({
                        name: "\u200b",
                        value: `**📤 Submitted by : **<@${interaction.user.id}>`,
                        inline: false,
                    }, ...(targetUser
                        ? [
                            {
                                name: "\u200b",
                                value: `**🎯 For : **<@${targetUser.id}>`,
                                inline: false,
                            },
                        ]
                        : []), {
                        name: "\u200b",
                        value: `**🕒 Submitted On : **<t:${Math.floor(Date.now() / 1000)}:F>`,
                    }, {
                        name: "\u200b",
                        value: `**Number of Quests : **${count}`,
                        inline: false,
                    }, {
                        name: "\u200b",
                        value: `**📌 Status : **${"Pending"}`,
                        inline: false,
                    }, {
                        name: "👤 User Status",
                        value: `**Total Pending : **${gquests.pending.length + 1}\n**Total Rewarded : **${gquests.rewarded.length}`,
                        inline: false,
                    })
                        .setFooter({
                        text: `${guild.name} Guild Quests`,
                        iconURL: "attachment://thumbnail.png",
                    })
                        .setImage("attachment://submitted_image.png")
                        .setTimestamp();
                    yield interaction.editReply({ content: "Please wait...." });
                    // send interaction reply
                    const reply = yield channel.send({
                        embeds: [submissionEmbed],
                        files: [submissionImage, thumbnail],
                    });
                    // insert a new gquest submission in db
                    const gquestOptions = {
                        serverID: guild.id,
                        userID: targetUser ? targetUser.id : interaction.user.id,
                        messageID: reply.id,
                        channelID: channel.id,
                        gquestCount: count,
                        imageUrl: gquestImage.url,
                        imageHash: "dummy hash",
                        status: "pending",
                        reviewedBy: "none",
                        submittedAt: Date.now(),
                    };
                    const newGquest = new guildQuestsSchema_1.default(gquestOptions);
                    yield newGquest.save();
                    // update user
                    user.gquests.lastSubmissionDate = new Date();
                    user.gquests.pending.push(newGquest._id);
                    yield user.save();
                    // edit embed
                    submissionEmbed.addFields({
                        name: "\u200b",
                        value: `**🪪 Submission ID : **\`${reply.id}\``,
                    });
                    yield reply.edit({
                        embeds: [submissionEmbed],
                        components: [],
                    });
                    // attach collectors to this gquest message
                    yield (0, gquestUtils_1.attachQuestMazeReviewCollector)(client, newGquest, "gq");
                }
                catch (err) {
                    console.error("Error in gquest submit subcommand callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in gquest submit subcommand :", err);
        return undefined;
    }
});
exports.default = init;
