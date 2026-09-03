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
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "remove-role",
                description: "Revokes the `Giveaways` role for a user.",
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
                            content: `⚠️ Invalid command. Please check your input and try again.`,
                        });
                        return;
                    }
                    //   get the role to assign
                    const grole = guild.roles.cache.find((role) => role.name === "Giveaways");
                    if (!grole) {
                        yield interaction.editReply({
                            content: `❌ The "Giveaways" role does not exist in this server.`,
                        });
                        return;
                    }
                    //   check if user already has this role
                    const guild_member = yield guild.members.fetch({
                        user: targetUser.id,
                        force: true,
                    });
                    const user_roles = Array.from(guild_member.roles.cache.entries()).map(([_, role]) => role.id);
                    if (!user_roles.includes(grole.id)) {
                        yield interaction.editReply({
                            content: `⚠️ <@${targetUser.id}> doesn’t have the \`Giveaways\` role.`,
                        });
                        return;
                    }
                    //   assign role
                    yield guild_member.roles.remove(grole);
                    yield interaction.editReply({
                        content: `✅ Revoked role <@&${grole.id}> from <@${targetUser.id}>.`,
                    });
                }
                catch (err) {
                    console.error("Error in giveaway remove-role callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in giveaway remove-role command : ", err);
        return undefined;
    }
});
exports.default = init;
