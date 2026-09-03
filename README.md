# Seraphina Discord Bot

Seraphina is a TypeScript Discord bot for Toram Online guild communities. It combines server moderation and engagement tools with leveling, giveaways, guild-activity workflows, raid coordination, and an AI-powered Seraphina assistant.

## Features

- **Leveling and ranks:** Awards XP for eligible messages and voice participation, applies level roles, sends level-up notifications, and generates rank and leaderboard cards.
- **Guild operations:** Manages giveaways, guild-quest and guild-maze submissions/reviews, raid coordination, and community-support campaigns.
- **Moderation and member events:** Provides bot-admin moderation commands plus welcome, farewell, and server-boost messages.
- **Toram assistance:** `t!` queries select a bundled Toram guide and ask Gemini to answer from its PDF content.
- **Seraphina assistant:** `s!` messages support conversational replies, command help, image analysis, mood-based responses, chat history, and a background memory pipeline.
- **Persistent recovery:** On startup, the bot restores active giveaways, pending guild-quest/maze reviews, raids, and support campaigns from MongoDB.

## How it works

`src/index.ts` loads `.env.<NODE_ENV>` (defaulting to `.env.development`), creates the Discord client, connects to MongoDB, initializes Qdrant collections, and logs in. The event handler dynamically loads the modules in `src/events/`.

Guild settings and activity data are stored in MongoDB through Mongoose models. On first seeing a guild, the bot creates a configuration record, creates or reuses its default leveling and giveaway roles, and creates user records for non-bot members. Slash commands are discovered from `src/commands/` and registered on the `ready` event:

- In development (`NODE_ENV` is anything other than `production`), commands are registered only in the guild named `Seraphina Development Server`.
- In production, commands are registered globally; Discord notes this may take up to an hour to propagate.

The cognition system stores structured memories in MongoDB and embeddings in Qdrant. A background worker processes one queued interaction every five minutes.

## Tech stack

- Node.js and TypeScript (CommonJS)
- Discord.js v14
- MongoDB with Mongoose
- Qdrant vector database
- Google Gemini (`@google/genai`) and OpenAI SDK
- Canvas rendering with `@napi-rs/canvas` / `canvas`
- `node-cron` for daily mood and giveaway-rank jobs

## Requirements

- Node.js 20 or newer
- A Discord application and bot token
- MongoDB connection URI
- A reachable Qdrant instance and API key
- Google Gemini API key
- OpenAI API key

The Discord application must be configured to allow the gateway intents requested by the bot: Guilds, Guild Members, Guild Messages, Message Content, Guild Presences, Guild Voice States, and Guild Message Reactions. The bot also needs Discord permissions appropriate for the features you enable, including sending messages, managing roles, and creating threads.

## Installation

```bash
git clone <repository-url>
cd discord-bot
npm install
```

## Configuration

The application reads a file named `.env.<NODE_ENV>`. With no `NODE_ENV` already set, it loads `.env.development`; use `NODE_ENV=production` to load `.env.production`.

Create the selected file with the variables used by the source code:

```dotenv
NODE_ENV=development
DISCORD_BOT_TOKEN=
ATLAS_URI=
GEMINI_API_KEY=
VECTOR_DB_URI=
VECTOR_DB_KEY=
OPENAI_API_KEY=
```

| Variable | Purpose |
| --- | --- |
| `DISCORD_BOT_TOKEN` | Authenticates the Discord bot. |
| `ATLAS_URI` | MongoDB connection string used for guild configuration, users, activity, and chat/memory records. |
| `GEMINI_API_KEY` | Used for Seraphina replies, image/guide assistance, rank-up messages, and embeddings. |
| `VECTOR_DB_URI` | Qdrant server URL. |
| `VECTOR_DB_KEY` | Qdrant API key. |
| `OPENAI_API_KEY` | Used by the cognition pipeline. |

Do not commit secrets. The repository ignores `.env`, `.env.development`, and `.env.production`.

### Per-server setup

When the bot is ready, it creates a default configuration for each guild it belongs to and makes the guild owner a bot admin. Use `/mod setup` to view the configuration checklist, then configure the relevant channels, manager roles, rewards, raid roles, and raid emojis with the commands below. Most non-admin commands are restricted to their configured feature channel.

## Commands

Commands are registered dynamically, so this is a group-level map rather than a duplicate of Discord’s command UI.

| Command | Purpose |
| --- | --- |
| `/ping` | Connectivity check. |
| `/mod` | Bot-admin setup, admin roles, moderation log channels, ban/kick actions, and welcome/farewell configuration. |
| `/lvl` | XP configuration and administration; rank and leaderboard views. |
| `/ga` | Giveaway setup, creation, entries, rerolls, winner history, and giveaway bans. |
| `/gq` | Guild-quest setup, screenshot submissions, review workflow, status, statistics, and leaderboards. |
| `/mz` | Guild-maze setup, submissions, review workflow, status, statistics, and leaderboards. |
| `/raid` | Raid setup, scheduling, scouting, participation, allocation/review, postponement, cancellation, and bans. |
| `/community-support` | Community-support channel/manager setup and support campaign creation. |

Text triggers are `t! <question>` for Toram guide queries and `s! <message>` for the Seraphina assistant. They are handled in guild text channels.

## Running the project

```bash
# Run TypeScript directly
npm start

# Run with nodemon; watches src/**/*.ts
npm run dev
```

## Development and build commands

| Command | What it does |
| --- | --- |
| `npm start` | Runs `ts-node src/index.ts`. |
| `npm run dev` | Runs the same entry point through nodemon. |
| `npm run build` | Compiles TypeScript to `dist/`, then copies `src/assets` and JSON files from `src/data`. |
| `npm run copy-assets` | Runs only the asset/JSON copy step. |
| `npm run count` | Runs `count-code-line`. |
| `npm test` | Currently exits with “no test specified”; there is no test suite configured. |

The current build copy step does **not** copy the PDF files under `src/data/guides`. Those PDFs are read by the `t!` feature, so make them available under `dist/data/guides` when running compiled output.

## Project structure

```text
src/
├── index.ts                 # Environment loading, database setup, Discord login
├── commands/                # Dynamic slash-command groups and subcommands
├── events/                  # Discord event handlers and ready-time restoration
├── models/                  # Mongoose schemas for config, users, workflows, memories
├── cognition/               # Queue, memory extraction, embeddings, Qdrant retrieval
├── canvas/                  # Rank, level-up, and leaderboard image generation
├── jobs/cron/               # Daily mood and giveaway-role jobs
├── utils/                   # Shared command, permission, workflow, and LLM utilities
├── data/                    # Knowledge bases, mood data, and Toram guide PDFs
└── assets/                  # Images, logos, backgrounds, badges, and documents
```

## Contributing

Keep changes focused, use the configured TypeScript compiler settings, and test the affected behavior in a development guild named `Seraphina Development Server`. Command and event modules are loaded from the filesystem, so follow the existing directory conventions when adding them.

## License

ISC, as declared in `package.json`.
