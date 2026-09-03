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
const commonUtils_1 = require("../../../utils/commonUtils");
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "ban",
                description: "Ban a user from guild",
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
                        required: false,
                    },
                ],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const user = interaction.options.getUser("user");
                    const reason = interaction.options.getString("reason");
                    const guild = interaction.guild;
                    if (!user || !guild || user.bot) {
                        interaction.editReply({
                            content: "⚠️ Invalid command. Please check your input and try again.",
                        });
                        return;
                    }
                    const guildConfig = yield configSchema_1.default.findOne({ serverID: guild.id });
                    if (!guildConfig) {
                        yield interaction.editReply("🔍 This server could not be identified. Check if the bot has access.");
                        return;
                    }
                    const { moderationConfig, bannedUsers } = guildConfig;
                    const { banChannelID } = moderationConfig;
                    const channel = yield guild.channels.fetch(banChannelID, {
                        force: true,
                    });
                    if (!channel || channel.type !== discord_js_1.ChannelType.GuildText) {
                        yield interaction.editReply({ content: "Invalid channel." });
                        return;
                    }
                    //   add to banned users of guild
                    bannedUsers.addToSet({
                        userID: user.id,
                        reason: reason !== null && reason !== void 0 ? reason : "",
                        banDate: new Date(),
                        banBy: interaction.user.id,
                    });
                    const thumbnail = (0, commonUtils_1.getThumbnail)();
                    //   send a message embed at channel
                    const banEmbed = new discord_js_1.EmbedBuilder()
                        .setTitle("🔨 User Banned")
                        .setColor(discord_js_1.Colors.Red)
                        .setThumbnail(user.displayAvatarURL())
                        .addFields({
                        name: "\u200b",
                        value: `**👤 Banned User : **${user.tag} (\`${user.id}\`)`,
                        inline: false,
                    }, {
                        name: "\u200b",
                        value: `**🛡️ Banned By : **${interaction.user.username} (\`${interaction.user.displayName}\`)`,
                        inline: false,
                    }, {
                        name: "\u200b",
                        value: `**📄 Reason : **${reason || "No reason provided."}`,
                        inline: false,
                    })
                        .setFooter({
                        text: "User banned from the server",
                        iconURL: "attachment://thumbnail.png",
                    })
                        .setTimestamp();
                    yield channel.send({ embeds: [banEmbed], files: [thumbnail] });
                    yield guildConfig.save();
                    yield interaction.editReply({
                        content: `${user.displayName} is banned from the server.`,
                    });
                }
                catch (err) {
                    console.error("Error in ban subcommand callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Cannot ban user : ", err);
        return undefined;
    }
});
exports.default = init;
