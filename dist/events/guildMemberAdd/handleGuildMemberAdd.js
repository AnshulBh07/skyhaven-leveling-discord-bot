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
const createNewUser_1 = require("../../utils/createNewUser");
const helperArrays_1 = require("../../data/helperArrays");
const commonUtils_1 = require("../../utils/commonUtils");
const getAllFiles_1 = __importDefault(require("../../utils/getAllFiles"));
const path_1 = __importDefault(require("path"));
const configSchema_1 = __importDefault(require("../../models/configSchema"));
const execute = (client, member) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (member.user.bot)
            return;
        yield (0, createNewUser_1.createNewUser)(client, member.guild.id, member.id);
        const guild = member.guild;
        const guildConfig = yield configSchema_1.default.findOne({ serverID: guild.id });
        if (!guildConfig)
            return;
        const { moderationConfig, kickedUsers } = guildConfig;
        const { welcomeChannelID, botAdminIDs } = moderationConfig;
        const thumbnail = (0, commonUtils_1.getThumbnail)();
        const allImages = (0, getAllFiles_1.default)(path_1.default.join(__dirname, "../..", "assets/images/welcome_msg"), false);
        const generateWelcomeEmbed = (message, guildName) => {
            const welcomeEmbed = new discord_js_1.EmbedBuilder()
                .setTitle(`🛬 Welcome to ${guildName}!`)
                .setDescription([
                message,
                "",
                "But before you take off on your adventure, we need to verify you're part of the guild. Follow the steps below:",
                "",
                "__**How to Verify:**__",
                "📌 **Step 1:** Go to the `#verification` channel.",
                "📝 **Step 2:** Type your **IGN** (in-game name).",
                "📱 **Step 3:** Open Toram → Menu → Community → Guild.",
                "📸 **Step 4:** Take a screenshot of your **guild page**.",
                "📤 **Step 5:** Send **both** your IGN and screenshot.",
                "",
                "⏳ Once done, hang tight! We'll verify you shortly.",
            ].join("\n"))
                .setColor("Blue")
                .setImage("attachment://guildImg.png")
                .setFooter({
                text: `${guildName} • Let the adventure begin!`,
                iconURL: "attachment://thumbnail",
            })
                .setTimestamp();
            return welcomeEmbed;
        };
        const guildImg = new discord_js_1.AttachmentBuilder((0, commonUtils_1.getRandomImage)(allImages)).setName("guildImg.png");
        // get welcome channel
        const welcomeChannel = yield guild.channels.fetch(welcomeChannelID, {
            force: true,
        });
        // send a welcome message regardless
        //   send welcome message
        if (welcomeChannel && welcomeChannel.type === discord_js_1.ChannelType.GuildText) {
            // generate welcome embed
            const randomMessage = helperArrays_1.welcomeMessages[Math.floor(Math.random() * helperArrays_1.welcomeMessages.length)].replace("{userId}", member.user.id);
            yield welcomeChannel.send({
                embeds: [generateWelcomeEmbed(randomMessage, guild.name)],
                files: [thumbnail, guildImg],
            });
        }
        // now we check if the user was kicked before from guild then we can send an alert to the bot admin users
        const userID = member.user.id;
        const kickedUser = kickedUsers.find((kicked) => kicked.userID === userID);
        if (kickedUser) {
            for (const adminID of botAdminIDs) {
                const admin = yield client.users.fetch(adminID);
                const embed = new discord_js_1.EmbedBuilder()
                    .setTitle("🚨 Kicked User Rejoined")
                    .setColor("Orange")
                    .setThumbnail(member.user.displayAvatarURL())
                    .addFields({ name: "👤 User", value: `${member.user.tag} (\`${member.id}\`)` }, {
                    name: "📄 Original Reason",
                    value: kickedUser.reason || "Not provided",
                }, {
                    name: "🕓 Kicked At",
                    value: `${kickedUser.kickDate}`,
                })
                    .setTimestamp();
                // send DM
                try {
                    yield admin.send({ embeds: [embed] });
                }
                catch (err) {
                    if (err.code === 50007) {
                        console.warn(`Cannot send alert to ${admin.displayName} (${admin.id}), skipping admin...`);
                    }
                    else
                        throw err;
                }
            }
        }
    }
    catch (err) {
        console.error(err);
    }
});
exports.default = execute;
