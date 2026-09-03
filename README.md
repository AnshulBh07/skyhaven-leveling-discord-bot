# Seraphina Discord Bot

Seraphina is an intelligent Discord bot tailored for gaming communities and Toram Online guilds. Built with TypeScript, Node.js, Discord.js v14, MongoDB, and Qdrant Vector Database, Seraphina combines automated server operations with an evolving, multi-layered cognitive AI assistant.

---

## Key Features

* **Cognitive AI Assistant (`s! <message>`)**:
  * Powered by Google Gemini 2.5 Flash and OpenAI.
  * Long-term personalized memory using Qdrant vector retrieval and MongoDB.
  * Multi-layer cognitive architecture tracking episodic experiences, semantic beliefs, interpersonal relationship bonds (trust, attachment), and self-reflections.
  * 17 dynamic mood personalities (e.g. *serene*, *tsundere*, *divinePride*, *playful*) rotating daily or configurable by administrators.
* **Toram Online Guide Assistant (`t! <question>`)**:
  * Semantic and fuzzy knowledge lookup across bundled guide PDFs in `src/data/guides/` answering player build and game mechanics queries.
* **Server Leveling & Activity Rewards (`/lvl`)**:
  * Automatic XP calculation for text, attachments, reactions, emojis, and voice channel participation.
  * Customizable cooldowns, role progression tiers, and notification channels.
  * High-resolution canvas-rendered rank cards and interactive top-10 leaderboards.
* **Guild Operations & Coordination**:
  * **/raid**: 12-player boss raid coordination with role allotment (Tank, DPS, Support), automated countdown reminders (scouting, participation, review), and attendance reliability scoring.
  * **/gq & /mz**: Submission and review workflows for guild quests and maze runs, utilizing perceptual image hashing to detect duplicate screenshots.
  * **/ga**: Automated giveaway management with level-based role access checks and reroll features.
  * **/community-support**: Crowdfunded community support campaigns and donation tracking.
* **Moderation & Community Management (`/mod`)**:
  * Interactive configuration checklist (`/mod setup`), bot admin delegations, welcome/farewell cards, boost notifications, and ban/kick logging.

---

## Architectural Overview

Seraphina separates high-throughput Discord gateway events and immediate conversational responses from CPU-intensive graphics rendering and background cognitive synthesis:

```mermaid
flowchart TD
    Discord["Discord Gateway / REST API"] --> Events["Event & Interaction Routers"]
    
    subgraph CoreServices["Seraphina Core Services"]
        Events --> ConfigCache["Guild Config Cache (60s TTL)"]
        Events --> Leveling["Leveling & XP Engine"]
        Events --> CommandExec["Slash Command Execution"]
        Events --> AIConversation["Seraphina Assistant (s!)"]
        Events --> ToramAssistant["Toram Guide Assistant (t!)"]
    end
    
    subgraph CanvasPipeline["Canvas Graphics Engine"]
        CommandExec --> CanvasEngine["Canvas Graphics Engine (Rank & Leaderboards)"]
        CanvasEngine <--> StaticAssets["In-Memory Decoded Asset Cache"]
    end
    
    subgraph DataStorage["Persistence Layer"]
        ConfigCache <--> MongoDB[("MongoDB (Mongoose)")]
        Leveling <--> MongoDB
        CommandExec <--> MongoDB
        AIConversation <--> MongoDB
        AIConversation <--> Qdrant[("Qdrant Vector DB")]
    end
    
    subgraph BackgroundWorkers["Background Asynchronous Workers"]
        AIConversation -.-> CognitionQueue["Cognition Queue"]
        CronWorker["5-Minute Cron Worker"] --> CognitionQueue
        CronWorker --> MemoryExtractors["OpenAI Memory Extraction"]
        MemoryExtractors --> Qdrant
        MemoryExtractors --> MongoDB
    end
```

For in-depth architectural details, refer to the [System Architecture Guide](docs/ARCHITECTURE.md).

---

## Project Structure

```text
src/
├── index.ts                 # Application entry point: env loading, DB connect, bot login
├── commands/                # Slash command definitions organized by subsystem
│   ├── community-support/   # Community fundraising campaigns
│   ├── giveaways/           # Giveaways and role raffles
│   ├── gquests/             # Guild quest screenshot submissions & reviews
│   ├── leveling/            # Leveling administration, rank cards, leaderboards
│   ├── maze/                # Maze climb submissions & leaderboards
│   ├── moderation/          # Bot admins, welcome/farewell channels, bans/kicks
│   └── raids/               # Boss raid scheduling, scouting, team review
├── events/                  # Discord gateway event handlers
│   ├── messageCreate/       # XP tracking (handleMessageEvents) and AI chat triggers
│   ├── interactionCreate/   # Slash command routing and modal submission handlers
│   ├── voiceStateUpdate/    # Voice activity XP tracking
│   └── ready/               # Command registration and state recovery
├── cognition/               # Memory architecture and cognition pipeline
│   ├── queues.ts/           # Cognition FIFO queue and scheduled worker
│   ├── vector/              # Qdrant client, Gemini embeddings, memory retrieval
│   └── zodValidation/       # Zod schemas validating structured memory extraction
├── models/                  # Mongoose schemas (Config, User, Raid, Memories, Quests)
├── canvas/                  # Canvas rendering for rank cards and leaderboards
├── jobs/cron/               # Cron jobs: daily mood, giveaway role checks, cognition worker
├── data/                    # JSON knowledge bases, mood definitions, and Toram guide PDFs
└── utils/                   # Shared helpers: config cache, permissions, raid timers
```

---

## Installation & Setup

### Prerequisites
* **Node.js**: Version `>= 20.0.0`
* **MongoDB**: A running MongoDB instance (e.g. MongoDB Atlas)
* **Qdrant**: A running Qdrant vector database instance (cloud or self-hosted)
* **API Keys**:
  * Discord Bot Token (with all Privileged Gateway Intents enabled)
  * Google Gemini API Key
  * OpenAI API Key

### Installation Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd discord-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env.development` or `.env.production` file in the project root:
   ```dotenv
   NODE_ENV=development
   DISCORD_BOT_TOKEN=your_discord_bot_token_here
   ATLAS_URI=mongodb+srv://user:pass@cluster.mongodb.net/seraphina?retryWrites=true&w=majority
   GEMINI_API_KEY=your_gemini_api_key_here
   VECTOR_DB_URI=https://your-qdrant-cluster.qdrant.tech:6333
   VECTOR_DB_KEY=your_qdrant_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|:---:|---|
| `NODE_ENV` | No | Specifies environment (`development` or `production`). Defaults to `development`. Controls command registration scope. |
| `DISCORD_BOT_TOKEN` | Yes | Discord Bot Application Token for gateway authentication. |
| `ATLAS_URI` | Yes | MongoDB connection string for all relational and memory models. |
| `GEMINI_API_KEY` | Yes | Google Gemini API key used for conversational AI (`s!`), Toram queries (`t!`), vision analysis, and text embeddings (`text-embedding-004`). |
| `VECTOR_DB_URI` | Yes | Endpoint URL for the Qdrant vector database cluster. |
| `VECTOR_DB_KEY` | Yes | API authorization key for Qdrant. |
| `OPENAI_API_KEY` | Yes | OpenAI API key used by background memory extraction agents. |

---

## Running the Bot

```bash
# Run in development mode (watches src/**/*.ts with nodemon)
npm run dev

# Run directly via ts-node
npm start

# Compile TypeScript to dist/ and bundle assets
npm run build
```

> **Note on Production Builds**: The `npm run build` script compiles TypeScript into `dist/` and copies `src/assets` and JSON data files. To use the `t!` Toram guide query system in production, verify that `src/data/guides/*.pdf` are copied or symlinked to `dist/data/guides/`.

---

## Discord Commands Summary

| Command | Purpose | Access Level |
|---|---|---|
| `/lvl rank` | Displays current level, total XP, and server rank card. | Public |
| `/lvl leaderboard` | Interactive canvas leaderboard with XP filter and pagination. | Public |
| `/raid start` | Schedules a 12-player guild raid with role reactions and timers. | Raid Manager |
| `/raid review` | Interactive attendance review thread and reliability scoring. | Raid Manager |
| `/gq submit` | Submits guild quest screenshot for reward review. | Public |
| `/mz submit` | Submits maze run screenshot for reward review. | Public |
| `/ga create` | Creates a scheduled role-eligible giveaway. | Giveaway Manager |
| `/mod setup` | Diagnostic checklist of guild channel and role configurations. | Server Owner |
| `/mod mood` | Views or manually overrides Seraphina's active personality mood. | Bot Admin |
| `s! <message>` | Engages Seraphina in AI conversation with personal memory. | Public |
| `t! <query>` | Answers Toram Online gameplay questions from bundled guide PDFs. | Public |

For detailed options, arguments, and permission rules, see [Command Documentation](docs/COMMANDS.md).

---

## Complete Documentation Links

* [System Architecture & Lifecycle](docs/ARCHITECTURE.md)
* [Cognitive Pipeline & Memory Architecture](docs/COGNITIVE_BEHAVIOR.md)
* [Database Architecture & Mongoose/Qdrant Schemas](docs/DATABASE.md)
* [Command Subsystems & Permissions Reference](docs/COMMANDS.md)

---

## License

ISC License declared in `package.json`.
