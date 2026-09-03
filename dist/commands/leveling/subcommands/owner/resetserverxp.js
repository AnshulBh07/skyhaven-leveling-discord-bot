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
const userSchema_1 = __importDefault(require("../../../../models/userSchema"));
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "resetserverxp",
                description: "Reset XP and levels for all users in the server",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const guildID = interaction.guildId;
                    if (!guildID) {
                        yield interaction.editReply({
                            content: "⚠️ Invalid command. Please check your input and try again.",
                        });
                        return;
                    }
                    const guildConfig = yield configSchema_1.default.findOne({ serverID: guildID });
                    if (!guildConfig) {
                        yield interaction.editReply("🔍 This server could not be identified. Check if the bot has access.");
                        return;
                    }
                    // IMPORTANT - confirmation prompt
                    const buttonsRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                        .setCustomId("confirm")
                        .setLabel("✅ Confirm")
                        .setStyle(discord_js_1.ButtonStyle.Danger), new discord_js_1.ButtonBuilder()
                        .setCustomId("cancel")
                        .setLabel("❌ Cancel")
                        .setStyle(discord_js_1.ButtonStyle.Secondary));
                    yield interaction.editReply({
                        content: "**⚠️ This will reset XP and level data for _all users_ in this server.**\nAre you sure you want to proceed?",
                        components: [buttonsRow],
                    });
                    // always attach collector to reply for that particular message only or the collector will listen to all the inetractions on that channel causing malfunction
                    const reply = yield interaction.fetchReply();
                    const collector = reply.createMessageComponentCollector({
                        componentType: discord_js_1.ComponentType.Button,
                        time: 30000,
                        filter: (btnInt) => btnInt.user.id === interaction.user.id &&
                            ["cancel", "confirm"].includes(btnInt.customId) &&
                            !btnInt.user.bot,
                    });
                    // collect user input from buttons
                    collector === null || collector === void 0 ? void 0 : collector.on("collect", (btnInt) => __awaiter(void 0, void 0, void 0, function* () {
                        if (btnInt.customId === "cancel") {
                            yield btnInt.update({
                                content: "Reset Cancelled",
                                components: [],
                            });
                            collector.stop(); //fire the on end event
                            return;
                        }
                        if (btnInt.customId === "confirm") {
                            yield btnInt.update({
                                content: "♻️ Resetting all XP and levels...",
                                components: [],
                            });
                            const { levelRoles, notificationChannelID } = guildConfig.levelConfig;
                            const allRelatedRoles = levelRoles.map((role) => role.roleID);
                            const basicRoleId = allRelatedRoles[0];
                            const users = yield userSchema_1.default.find({ serverID: guildID });
                            const guild = yield client.guilds.fetch({
                                guild: guildID,
                            });
                            for (const user of users) {
                                const guild_member = yield guild.members.fetch({
                                    user: user.userID,
                                    force: true,
                                });
                                if (!guild_member)
                                    continue;
                                const memberRoles = guild_member.roles.cache.map((role) => role.id);
                                // remove all related roles from all users
                                for (const role of allRelatedRoles) {
                                    if (memberRoles.includes(role))
                                        yield guild_member.roles.remove(role);
                                }
                                // add basicrole
                                yield guild_member.roles.add(basicRoleId);
                            }
                            yield userSchema_1.default.updateMany({ serverID: guildID }, {
                                $set: {
                                    "leveling.xp": 0,
                                    "leveling.totalXp": 0,
                                    "leveling.level": 1,
                                    "leveling.currentRole": basicRoleId,
                                    "leveling.lastPromotionTimestamp": new Date(),
                                    "leveling.voiceXp": 0,
                                    "leveling.textXp": 0,
                                    "leveling.xpPerDay": new Map(),
                                },
                            });
                            const notifChannel = yield guild.channels.fetch(notificationChannelID, { force: true });
                            if (!notifChannel) {
                                yield interaction.editReply({
                                    content: "Notification channel not found.",
                                });
                                return;
                            }
                            if (notifChannel && notifChannel.isTextBased()) {
                                yield notifChannel.send({
                                    content: `🧨 **Server XP Reset Notice**\nAll users' XP and levels have been **reset** by an administrator.\nEveryone has been returned to **Level 1** and their default roles.\n\n🔁 Let the grind begin again!\nEarn XP through chatting and participating to level up and unlock new roles.`,
                                });
                            }
                            yield interaction.editReply("XP and level has been reset for all users in the server.");
                            collector.stop();
                        }
                    }));
                    // collected contains a map/collection of all the interactions untill event ends
                    collector === null || collector === void 0 ? void 0 : collector.on("end", (collected, reason) => __awaiter(void 0, void 0, void 0, function* () {
                        if (reason === "time" && !collected.size) {
                            yield interaction.editReply({
                                content: "⏱️ Confirmation timed out. Reset was not performed.",
                                components: [],
                            });
                        }
                    }));
                }
                catch (err) {
                    console.error("Error in lvl resetserverxp subcommand callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in lvl resetserverxp subcommand : ", err);
        return undefined;
    }
});
exports.default = init;
