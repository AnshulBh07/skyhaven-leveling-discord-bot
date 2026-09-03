import { Client, IntentsBitField } from "discord.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import eventHandler from "./handlers/eventHandler";
import { setupQdrant } from "./cognition/vector/qdrant";

const myIntents = new IntentsBitField();
myIntents.add(
	IntentsBitField.Flags.Guilds,
	IntentsBitField.Flags.GuildMembers,
	IntentsBitField.Flags.GuildMessages,
	IntentsBitField.Flags.MessageContent,
	IntentsBitField.Flags.GuildPresences,
	IntentsBitField.Flags.GuildVoiceStates,
	IntentsBitField.Flags.GuildMessageReactions,
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
		await Promise.all([
			mongoose.connect(process.env.ATLAS_URI || ""),
			setupQdrant(),
		]);

		bot.login(process.env.DISCORD_BOT_TOKEN);
		// await insertUsers();
		// console.log("users added");
	} catch (err) {
		console.error("Fatal startup failure during initialization:", err);
		process.exit(1);
	}
};

process.on("unhandledRejection", (reason) => {
	console.error("Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (err) => {
	console.error("Uncaught Exception encountered:", err);
	process.exit(1);
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
