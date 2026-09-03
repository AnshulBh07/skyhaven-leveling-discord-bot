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
// a fucntion that will execute all types of interactionCreate event commands according to local commands
const discord_js_1 = require("discord.js");
const getLocalCommands_1 = __importDefault(require("../../utils/getLocalCommands"));
const configCache_1 = require("../../utils/configCache");
const configurationCheck_1 = require("../../utils/configurationCheck");
const execute = (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        if (!interaction.isChatInputCommand())
            return;
        const guild = interaction.guild;
        if (!guild) {
            yield interaction.reply({
                content: "Invalid input. Please try again.",
                flags: "Ephemeral",
            });
            return;
        }
        if (!interaction.deferred && !interaction.replied) {
            yield interaction.deferReply({ flags: "Ephemeral" });
        }
        const guildConfig = yield (0, configCache_1.getCachedGuildConfig)(guild.id);
        if (!guildConfig) {
            yield interaction.editReply({
                content: "No guild/server found.",
            });
            return;
        }
        const { botAdminIDs } = guildConfig.moderationConfig;
        const isAdmin = botAdminIDs.includes(interaction.user.id);
        const { seraphinaMood } = guildConfig.moodConfig;
        const setupCommands = {
            ga: ["add-admin", "remove-admin", "channel", "use-role"],
            gq: ["add-admin", "remove-admin", "channel", "use-role", "reward-amount"],
            mz: ["channel", "use-role", "reward-amount"],
            lvl: ["add-admin", "remove-admin", "channel", "resetserverxp"],
            raid: [
                "add-admin",
                "remove-admin",
                "channel",
                "tank-emoji",
                "dps-emoji",
                "support-emoji",
                "use-role",
            ],
            mod: [
                "add-admin",
                "remove-admin",
                "setup",
                "farewell-channel",
                "welcome-channel",
            ],
        };
        const cmd = interaction.commandName;
        const sub = interaction.options.getSubcommand(false);
        const isSetupCommand = (_a = setupCommands[cmd]) === null || _a === void 0 ? void 0 : _a.includes(sub || "");
        // 1. bot must be configured
        // 2. only mod commands are allowed otherwise (mod commands only usable by bot admins)
        if (!(0, configurationCheck_1.guildConfigCheck)(guildConfig)) {
            if (isAdmin && isSetupCommand) {
                console.log(`Admin command used: ${interaction.commandName} - ${interaction.options.getSubcommand(false)} for guild ${(_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.name}`);
            }
            else {
                yield interaction.editReply({
                    content: isAdmin
                        ? "⚠️ **Server Configuration Not Found**\nAs a bot admin, please initialize the server by running `/mod setup`. This will guide you through the required configuration steps.\n\nUntil it's set up, most features will remain disabled."
                        : "⚠️ **Server Not Yet Configured**\nThe bot hasn't been set up for this server. Please contact a server admin or bot manager.",
                });
                return;
            }
        }
        if (guildConfig.levelConfig.blacklistedChannels.includes(interaction.channelId)) {
            yield interaction.editReply({
                content: "Commands are not allowed in this channel.",
            });
            return;
        }
        const devsID = guildConfig.devsIDs;
        const localCommands = yield (0, getLocalCommands_1.default)();
        if (!localCommands) {
            yield interaction.editReply({
                content: "No commands found",
            });
            return;
        }
        // now find command object from local commands
        const commandObject = localCommands.find((cmd) => cmd.name == interaction.commandName);
        if (!commandObject) {
            yield interaction.editReply({ content: "Command object doesn't exist" });
            return;
        }
        if (commandObject.devOnly) {
            const memberID = (_c = interaction.member) === null || _c === void 0 ? void 0 : _c.user.id;
            //   check devs only
            if (!(devsID || []).includes(memberID)) {
                yield interaction.editReply({
                    content: "❌ You don't have access to this command.",
                });
                return;
            }
        }
        //   apply permissions logic here
        if (((_d = commandObject.permissionsRequired) === null || _d === void 0 ? void 0 : _d.length) &&
            interaction.member instanceof discord_js_1.GuildMember) {
            // check for all permissions
            for (const permission of commandObject.permissionsRequired) {
                if (!((_e = interaction.member) === null || _e === void 0 ? void 0 : _e.permissions.has(permission))) {
                    yield interaction.editReply({
                        content: `You need the ${permission} to run this command.`,
                    });
                    return;
                }
            }
        }
        // after everything done execute the command callback
        yield commandObject.callback(client, interaction, seraphinaMood);
    }
    catch (err) {
        console.error("Error in chat input command interaction handler : ", err);
        if (interaction.isRepliable() && interaction.deferred && !interaction.replied) {
            yield interaction
                .editReply({
                content: "⚠️ An error occurred while executing this command. Please try again later.",
            })
                .catch((replyErr) => {
                console.error("Failed to send error reply to interaction:", replyErr);
            });
        }
    }
});
exports.default = execute;
