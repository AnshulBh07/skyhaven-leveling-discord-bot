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
// root file for leveling commands
const path_1 = __importDefault(require("path"));
const permissionsCheck_1 = require("../../utils/permissionsCheck");
const configSchema_1 = __importDefault(require("../../models/configSchema"));
const fetchSubCommands_1 = require("../../utils/fetchSubCommands");
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, fetchSubCommands_1.fetchAllSubcommands)(path_1.default.join(__dirname, "", "subcommands"), false);
        if (!result)
            return undefined;
        const [adminCommands, userCommands, ownerCommands, subcommandsMap] = result;
        return {
            name: "lvl",
            description: "All commands related to leveling system",
            options: Array.from(subcommandsMap.entries()).map(([_, subcommand]) => subcommand.data),
            permissionsRequired: [],
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    // for a valid command call the clalback function using map
                    const subcommandName = interaction.options.getSubcommand(false);
                    const guild = interaction.guild;
                    const channel = interaction.channel;
                    if (!guild || !channel) {
                        yield interaction.editReply({
                            content: "⚠️ Invalid command. Please check your input and try again.",
                        });
                        return;
                    }
                    if (!subcommandName) {
                        yield interaction.editReply({
                            content: "⚠️ No subcommands detected. Make sure you're using the correct syntax.",
                        });
                        return;
                    }
                    const subCmdKey = subcommandName;
                    const subCmd = subcommandsMap.get(subCmdKey);
                    if (!subCmd) {
                        yield interaction.editReply({
                            content: "⚠️ No subcommands detected. Make sure you're using the correct syntax.",
                        });
                        return;
                    }
                    const guildConfig = yield configSchema_1.default.findOne({ serverID: guild.id });
                    if (!guildConfig) {
                        yield interaction.editReply("🔍 This server could not be identified. Check if the bot has access.");
                        return;
                    }
                    const { botAdminIDs } = guildConfig.moderationConfig;
                    const { notificationChannelID } = guildConfig.levelConfig;
                    // if it is an owner command and user is not owner
                    if (ownerCommands.includes(subcommandName) &&
                        !botAdminIDs.includes(interaction.user.id)) {
                        yield interaction.editReply({
                            content: "⚠️ You lack the required permissions to use this command.",
                        });
                        return;
                    }
                    // check permissions
                    // command name is gonna be unique for given root command
                    if (adminCommands.includes(subcommandName)) {
                        if (!(yield (0, permissionsCheck_1.isManager)(client, interaction.user.id, guild.id, "lvl"))) {
                            yield interaction.editReply({
                                content: "⚠️ You lack the required permissions to use this command.",
                            });
                            return;
                        }
                    }
                    if (userCommands.includes(subcommandName)) {
                        if (!(yield (0, permissionsCheck_1.isUser)(client, interaction.user.id, guild.id, "lvl"))) {
                            yield interaction.editReply({
                                content: "⚠️ You lack the required permissions to use this command.",
                            });
                            return;
                        }
                    }
                    // admins and users will be forced to use designated channel
                    if (!botAdminIDs.includes(interaction.user.id) &&
                        channel.id !== notificationChannelID) {
                        yield interaction.editReply({
                            content: `⚠️ You cannot use this command in this channel. Please use it in <#${notificationChannelID}>.`,
                        });
                        return;
                    }
                    // call the function
                    yield subCmd.callback(client, interaction);
                }
                catch (err) {
                    console.error("Error in level root command callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in level root command : ", err);
        return undefined;
    }
});
exports.default = init;
