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
const helperArrays_1 = require("../../../../data/helperArrays");
const permissionsCheck_1 = require("../../../../utils/permissionsCheck");
const configSchema_1 = __importDefault(require("../../../../models/configSchema"));
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "scout",
                description: "Register buffs and debuffs for raid boss",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "raid_id",
                        description: "ID of raid to be scouted (Check the announcement message or scout reminder message)",
                        type: discord_js_1.ApplicationCommandOptionType.String,
                        required: true,
                    },
                ],
            },
            //   this command creates a thread at that channel and prompts admin to submit both images
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const guild = interaction.guild;
                    const channel = interaction.channel;
                    const raid_id = interaction.options.getString("raid_id");
                    if (!guild ||
                        !channel ||
                        channel.type !== discord_js_1.ChannelType.GuildText ||
                        !raid_id) {
                        yield interaction.editReply({
                            content: "⚠️ Invalid command. Please check your input and try again.",
                        });
                        return;
                    }
                    const guildConfig = yield configSchema_1.default.findOne({ serverID: guild.id });
                    if (!guildConfig) {
                        yield interaction.editReply({
                            content: "Guild not found!!",
                        });
                        return;
                    }
                    const { raidConfig } = guildConfig;
                    const { participantRole } = raidConfig;
                    //   create a thread and prompt user to send image
                    const buffsThread = yield channel.threads.create({
                        name: "Buffs and Debuffs Submission",
                        autoArchiveDuration: 60,
                    });
                    yield buffsThread.send({
                        content: "Please send images only for boss buffs followed by debuffs here.",
                    });
                    const rootCollector = buffsThread.createMessageCollector({
                        filter: (msg) => !msg.author.bot,
                        time: 0,
                    });
                    rootCollector.on("collect", (msg) => __awaiter(void 0, void 0, void 0, function* () {
                        try {
                            // check if the message author is valid
                            const isAdmin = yield (0, permissionsCheck_1.isManager)(client, msg.author.id, guild.id, "raid");
                            if (!isAdmin) {
                                yield buffsThread.send({
                                    content: "You do not have permission to interact in this thread.",
                                });
                                return;
                            }
                            if (msg.content.length > 0) {
                                yield buffsThread.send({
                                    content: "Please include images only in your submission.",
                                });
                                return;
                            }
                            const attachments = Array.from(msg.attachments.entries()).map(([_, attachment]) => attachment);
                            //   check validity of submissions
                            if (attachments.length !== 2 ||
                                attachments.some((attachment) => attachment.contentType &&
                                    !attachment.contentType.startsWith("image/"))) {
                                yield buffsThread.send({
                                    content: "Invalid submission. Please try again.",
                                });
                                return;
                            }
                            // everything valid, update db
                            const updatedRaid = yield raidSchema_1.default.findOneAndUpdate({ announcementMessageID: raid_id, serverID: guild.id }, {
                                $set: {
                                    bossBuffsImageUrl: attachments[0].url,
                                    bossDebuffsImageUrl: attachments[1].url,
                                    stage: "scouted",
                                    "raidTimestamps.scoutTime": Date.now(),
                                },
                            }, { new: true });
                            if (!updatedRaid)
                                return;
                            // this code will only be used in edge cases where a user is somehow to allocated raider role for some reason
                            const { participants, waitlist } = updatedRaid;
                            const joiners = [...participants.dps, ...participants.tank, ...participants.support, ...waitlist.dps, ...waitlist.support, ...waitlist.tank];
                            const role = yield guild.roles.fetch(participantRole, { force: true });
                            if (role)
                                for (const joiner of joiners) {
                                    const member = yield guild.members.fetch({ user: joiner, force: true });
                                    if (member.roles.cache.get(participantRole))
                                        continue;
                                    yield member.roles.add(participantRole);
                                }
                            // send an embed at channel and delete the thread
                            yield buffsThread.send({
                                content: "Thanks for your submission. Please wait while we process it.",
                            });
                            const buffs = new discord_js_1.AttachmentBuilder(updatedRaid.bossBuffsImageUrl).setName("buffs.png");
                            const debuffs = new discord_js_1.AttachmentBuilder(updatedRaid.bossDebuffsImageUrl).setName("debuffs.png");
                            const thumbnail = new discord_js_1.AttachmentBuilder(helperArrays_1.leaderboardThumbnail).setName("thumbnail.png");
                            const scoutEmbed = new discord_js_1.EmbedBuilder()
                                .setTitle("🕵️‍♀️ Scout Intel: Buffs & Debuffs")
                                .setDescription(`Our scouts have risked their lives to bring you this crucial intel. Read carefully. Or don't. But don’t blame us when ${updatedRaid.bosses[0]
                                .split("_")
                                .map((boss) => { var _a; return ((_a = boss.at(0)) === null || _a === void 0 ? void 0 : _a.toUpperCase()) + boss.slice(1); })
                                .join(" ")} slaps you.`)
                                .setColor("Orange")
                                .setThumbnail("attachment://thumbnail.png")
                                .setFooter({
                                text: "If you die, it's probably your fault. Scouts out. Meet you guys at raid.",
                            })
                                .setTimestamp();
                            const role_req = yield guild.roles.fetch(participantRole, { force: true });
                            const scoutMsg = yield channel.send({
                                content: role_req ? `${role_req}` : "",
                                allowedMentions: { roles: role_req ? [role_req.id] : [] },
                                embeds: [scoutEmbed],
                                files: [thumbnail],
                            });
                            yield channel.send({ files: [buffs] });
                            yield channel.send({ files: [debuffs] });
                            updatedRaid.scoutMessageID = scoutMsg.id;
                            yield updatedRaid.save();
                            // add a link button on annoucnement message
                            const announceMsg = yield channel.messages.fetch(updatedRaid.announcementMessageID);
                            const prevComponents = announceMsg.components;
                            const messageLink = `https://discord.com/channels/${guild.id}/${channel.id}/${scoutMsg.id}`;
                            const LinkButton = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                                .setLabel("Jump to Buffs and Debuffs")
                                .setStyle(discord_js_1.ButtonStyle.Link)
                                .setURL(messageLink));
                            yield announceMsg.edit({
                                components: [...prevComponents, LinkButton],
                            });
                            yield buffsThread.delete("Buffs registered");
                        }
                        catch (err) {
                            console.error("Error in root buff submission collector : ", err);
                        }
                    }));
                    yield interaction.editReply({
                        content: "Raid buffs and debuffs registeration process started.",
                    });
                }
                catch (err) {
                    console.error("Error in raid scout subcommand callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in raid scout subcommand : ", err);
        return undefined;
    }
});
exports.default = init;
