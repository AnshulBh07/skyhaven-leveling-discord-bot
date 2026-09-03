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
const configSchema_1 = __importDefault(require("../../models/configSchema"));
const userSchema_1 = __importDefault(require("../../models/userSchema"));
const helperArrays_1 = require("../../data/helperArrays");
const commonUtils_1 = require("../../utils/commonUtils");
const execute = (client, member) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // remove the member from guild config and send a farewell message on farewell channel
        const guild = member.guild;
        const userID = member.user.id;
        const guildConfig = yield configSchema_1.default.findOne({ serverID: guild.id });
        if (!guildConfig)
            return;
        const { moderationConfig } = guildConfig;
        const { farewellChannelID } = moderationConfig;
        const farewellChannel = yield guild.channels.fetch(farewellChannelID, {
            force: true,
        });
        const user = yield userSchema_1.default.findOne({ userID: userID, serverID: guild.id });
        if (!user)
            return;
        yield configSchema_1.default.updateOne({ serverID: guild.id }, { $pull: { users: user._id } });
        const thumbnail = (0, commonUtils_1.getThumbnail)();
        const msg = helperArrays_1.farewellMessages[Math.floor(Math.random() * helperArrays_1.farewellMessages.length)].replace("<@{userId}>", `**${member.user.displayName}**`);
        const farewellEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("🍃 Farewell, Traveler")
            .setThumbnail(member.user.displayAvatarURL())
            .setDescription(msg.split(".").join("\n"))
            .setFooter({
            text: `${member.guild.name}`,
            iconURL: "attachment://thumbnail.png",
        });
        if (farewellChannel && farewellChannel.type === discord_js_1.ChannelType.GuildText) {
            yield farewellChannel.send({
                embeds: [farewellEmbed],
                files: [thumbnail],
            });
        }
    }
    catch (err) {
        console.error("Error in farewell handler", err);
    }
});
exports.default = execute;
