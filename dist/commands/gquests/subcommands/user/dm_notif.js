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
const userSchema_1 = __importDefault(require("../../../../models/userSchema"));
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            isSubCommand: true,
            data: {
                name: "dm-notif",
                description: "Toggle guild quest related DM notifications for user",
                type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "value",
                        description: "toggle on(true) or off(false)",
                        type: discord_js_1.ApplicationCommandOptionType.Boolean,
                        required: true,
                    },
                    {
                        name: "user",
                        description: "target user",
                        type: discord_js_1.ApplicationCommandOptionType.User,
                        required: false,
                    },
                ],
            },
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                try {
                    const toggleVal = interaction.options.getBoolean("value");
                    const guild = interaction.guild;
                    const targetUser = (_a = interaction.options.getUser("user")) !== null && _a !== void 0 ? _a : interaction.user;
                    if (typeof toggleVal === "undefined" || !guild) {
                        yield interaction.editReply({
                            content: "⚠️ Invalid command. Please check your input and try again.",
                        });
                        return;
                    }
                    //   update toggle in db
                    yield userSchema_1.default.findOneAndUpdate({ userID: targetUser.id }, { $set: { "gquests.dmNotif": toggleVal } });
                    yield interaction.editReply({
                        content: `📢 Notifications setting updated for user <@${targetUser.id}>`,
                    });
                }
                catch (err) {
                    console.error("Error in dm-notif callback : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in dm-notif subcommand : ", err);
        return undefined;
    }
});
exports.default = init;
