import { Client, IntentsBitField } from "discord.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import eventHandler from "./handlers/eventHandler";

const myIntents = new IntentsBitField();
myIntents.add(
  IntentsBitField.Flags.Guilds,
  IntentsBitField.Flags.GuildMembers,
  IntentsBitField.Flags.GuildMessages,
  IntentsBitField.Flags.MessageContent,
  IntentsBitField.Flags.GuildPresences
);

// create a bot instance
const bot = new Client({
  intents: myIntents,
});

const envFile = `.env.${process.env.NODE_ENV || "development"}`;

dotenv.config({ path: envFile });

eventHandler(bot)

// connect to db and initialise bot
const main = async () => {
  try {
    await mongoose.connect(process.env.ATLAS_URI || "");
    bot.login(process.env.DISCORD_BOT_TOKEN);
  } catch (err) {
    console.error(err);
    process.exit(0);
  }
};

main();
