import { Client, IntentsBitField } from "discord.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import eventHandler from "./handlers/eventHandler";
import Config from "./models/configSchema";
import User from "./models/userSchema";

const myIntents = new IntentsBitField();
myIntents.add(
  IntentsBitField.Flags.Guilds,
  IntentsBitField.Flags.GuildMembers,
  IntentsBitField.Flags.GuildMessages,
  IntentsBitField.Flags.MessageContent,
  IntentsBitField.Flags.GuildPresences,
  IntentsBitField.Flags.GuildVoiceStates,
  IntentsBitField.Flags.GuildMessageReactions
);

// create a bot instance
const bot = new Client({
  intents: myIntents,
});

const envFile = `.env.${process.env.NODE_ENV || "development"}`;

dotenv.config({ path: envFile });

eventHandler(bot);

console.log("fresh boot up...");

// setInterval(() => {
//   const used = process.memoryUsage().heapUsed / 1024 / 1024;
//   console.log(`Heap used: ${Math.round(used * 100) / 100} MB`);
// }, 2000);

// connect to db and initialise bot
const main = async () => {
  try {
    await mongoose.connect(process.env.ATLAS_URI || "");
    bot.login(process.env.DISCORD_BOT_TOKEN);
    // await insertUsers();
    // console.log("users added");
  } catch (err) {
    console.error(err);
    process.exit(0);
  }
};

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
