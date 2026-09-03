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
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "assignrole",
                description: "Assign the `Giveaways` role to a user",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "user",
                        description: "target user",
                        type: discord_js_1.ApplicationCommandOptionType.User,
                        required: true,
                    },
                ],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const targetUser = interaction.options.getUser("user");
                    const guild = interaction.guild;
                    if (!guild || !targetUser || targetUser.bot) {
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
                    const { giveawayRole } = guildConfig.giveawayConfig;
                    //   get the role to assign
                    const grole = yield guild.roles.fetch(giveawayRole, { force: true });
                    if (!grole) {
                        yield interaction.editReply({
                            content: "❌ No `Giveaways` role found in this server.\nPlease create a role named `Giveaways` before using this command.",
                        });
                        return;
                    }
                    //   check if user already has this role
                    const guild_member = yield guild.members.fetch({
                        user: targetUser.id,
                        force: true,
                    });
                    const user_roles = Array.from(guild_member.roles.cache.entries()).map(([_, role]) => role.id);
                    if (user_roles.includes(grole.id)) {
                        yield interaction.editReply({
                            content: `ℹ️ <@${targetUser.id}> already has the \`Giveaways\` role.`,
                        });
                        return;
                    }
                    //   assign role
                    yield guild_member.roles.add(grole);
                    yield interaction.editReply({
                        content: `✅ Successfully assigned the role <@&${grole.id}> to <@${targetUser.id}>.`,
                    });
                }
                catch (err) {
                    console.error("Error in giveaway assignrole callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in giveaway assignrole command : ", err);
        return undefined;
    }
});
exports.default = init;
