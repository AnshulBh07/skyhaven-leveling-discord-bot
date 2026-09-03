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
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const eventHandler_1 = __importDefault(require("./handlers/eventHandler"));
const qdrant_1 = require("./cognition/vector/qdrant");
const myIntents = new discord_js_1.IntentsBitField();
myIntents.add(discord_js_1.IntentsBitField.Flags.Guilds, discord_js_1.IntentsBitField.Flags.GuildMembers, discord_js_1.IntentsBitField.Flags.GuildMessages, discord_js_1.IntentsBitField.Flags.MessageContent, discord_js_1.IntentsBitField.Flags.GuildPresences, discord_js_1.IntentsBitField.Flags.GuildVoiceStates, discord_js_1.IntentsBitField.Flags.GuildMessageReactions);
// create a bot instance
const bot = new discord_js_1.Client({
    intents: myIntents,
});
const envFile = `.env.${process.env.NODE_ENV || "development"}`;
dotenv_1.default.config({ path: envFile });
(0, eventHandler_1.default)(bot);
console.log("fresh boot up...");
// setInterval(() => {
//   const used = process.memoryUsage().heapUsed / 1024 / 1024;
//   console.log(`Heap used: ${Math.round(used * 100) / 100} MB`);
// }, 2000);
// connect to db and initialise bot
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Promise.all([
            mongoose_1.default.connect(process.env.ATLAS_URI || ""),
            (0, qdrant_1.setupQdrant)(),
        ]);
        bot.login(process.env.DISCORD_BOT_TOKEN);
        // await insertUsers();
        // console.log("users added");
    }
    catch (err) {
        console.error(err);
        process.exit(0);
    }
});
main();
// fixer function to insert user IDs missing in config for a guild, only to be used manually
// const insertUsers = async () => {
//   try {
//     const guildID = "940123225831120947";
//     const guildConfig = await Config.findOne({ serverID: guildID });
//     if (!guildConfig) return;
//     const { users } = guildConfig;
//     const all_users = await User.find({ serverID: guildID });
//     for (const user of all_users) {
//       if (!users.includes(user._id)) users.push(user._id);
//     }
//     await guildConfig.save();
//   } catch (err) {
//     console.error("Error in insert users function : ", err);
//   }
// };
