"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverBoostMessages = exports.raidMessages = exports.welcomeMessages = exports.boostMessages = exports.giveawayStartMessages = exports.farewellMessages = exports.leaderboardThumbnail = exports.rolePromotionGifs = exports.lightBackgroundColors = exports.darkBackgroundColors = exports.roleDemotionMessages = exports.rolePromotionMessages = exports.xpBarColors = exports.discordBadges = exports.giveawayRoles = exports.levelRoles = void 0;
const path_1 = __importDefault(require("path"));
exports.levelRoles = [
    {
        name: "Noob",
        minLevel: 1,
        maxLevel: 4,
        color: "#dfa8ff", // Gray
    },
    {
        name: "Certified Lurker",
        minLevel: 5,
        maxLevel: 10,
        color: "#808080", // Gray
    },
    {
        name: "Yapmaster Apprentice",
        minLevel: 11,
        maxLevel: 20,
        color: "#1E90FF", // Dodger Blue
    },
    {
        name: "Message Goblin",
        minLevel: 21,
        maxLevel: 30,
        color: "#32CD32", // Lime Green
    },
    {
        name: "Keyboard Crusader",
        minLevel: 31,
        maxLevel: 40,
        color: "#FFA500", // Orange
    },
    {
        name: "Legendary Typist",
        minLevel: 41,
        maxLevel: 55,
        color: "#8A2BE2", // Blue Violet
    },
    {
        name: "The Yapfather",
        minLevel: 56,
        maxLevel: 68,
        color: "#FF69B4", // Hot Pink
    },
    {
        name: "Keyboard Thruster",
        minLevel: 69,
        maxLevel: 69,
        color: "#FF69B4", // Hot Pink — bold, cursed, fitting
    },
    {
        name: "Chat Ascendant",
        minLevel: 70,
        maxLevel: Infinity,
        color: "#FFD700", // Gold
    },
];
exports.giveawayRoles = [
    {
        name: "Giveaways",
        color: "#FF4500", // Orange Red
    },
    {
        name: "Gold Member",
        color: "#FFD700", // Gold
    },
    {
        name: "Silver Member",
        color: "#C0C0C0", // Silver
    },
    {
        name: "Bronze Member",
        color: "#CD7F32", // Bronze
    },
    {
        name: "Staff",
        color: "#4B0082", // Indigo
    },
];
exports.discordBadges = new Map([
    [
        "Staff",
        path_1.default.resolve(__dirname, "../assets/images/discord_badges/staff.png"),
    ],
    [
        "Partner",
        path_1.default.resolve(__dirname, "../assets/images/discord_badges/partner.png"),
    ],
    [
        "HypeSquadOnlineHouse1",
        path_1.default.resolve(__dirname, "../assets/images/discord_badges/bravery.png"),
    ],
    [
        "HypeSquadOnlineHouse2",
        path_1.default.resolve(__dirname, "../assets/images/discord_badges/brilliance.png"),
    ],
    [
        "HypeSquadOnlineHouse3",
        path_1.default.resolve(__dirname, "../assets/images/discord_badges/balance.png"),
    ],
    [
        "BugHunterLevel1",
        path_1.default.resolve(__dirname, "../assets/images/discord_badges/bughunter_1.png"),
    ],
    [
        "BugHunterLevel2",
        path_1.default.resolve(__dirname, "../assets/images/discord_badges/bughunter_2.png"),
    ],
    [
        "EarlySupporter",
        path_1.default.resolve(__dirname, "../assets/images/discord_badges/early_supporter.png"),
    ],
    [
        "VerifiedDeveloper",
        path_1.default.resolve(__dirname, "../assets/images/discord_badges/developer.png"),
    ],
    [
        "CertifiedModerator",
        path_1.default.resolve(__dirname, "../assets/images/discord_badges/certified_moderator.png"),
    ],
    [
        "ActiveDeveloper",
        path_1.default.resolve(__dirname, "../assets/images/discord_badges/active_developer.png"),
    ],
    [
        "HypeSquad",
        path_1.default.resolve(__dirname, "../assets/images/discord_badges/hypesquad_events.png"),
    ],
    [
        "PremiumEarlySupporter",
        path_1.default.resolve(__dirname, "../assets/images/discord_badges/early_supporter.png"),
    ],
    [
        "ServerBooster",
        path_1.default.resolve(__dirname, "../assets/images/discord_badges/boosting_1.png"),
    ],
    [
        "Nitro",
        path_1.default.resolve(__dirname, "../assets/images/discord_badges/nitro.png"),
    ],
]);
exports.xpBarColors = [
    "#00ffff", // Cyan / Aqua
    "#32cd32", // Lime Green
    "#ffd700", // Gold
    "#1e90ff", // Dodger Blue
    "#ff1493", // Deep Pink
    "#ffa500", // Orange
];
exports.rolePromotionMessages = [
    "🗣️ {user} just wouldn't shut up—so we gave them the mighty **{role}** title. Chaos certified.",
    "📢 {user} monologued into legend status. Welcome to **{role}**, you vocal menace.",
    "🐶 {user} barked their way to glory and earned **{role}**. Woofin' fantastic!",
    "🎙️ {user} hit a new frequency of squawking. Promoted to **{role}**. Our ears may never recover.",
    "🗯️ {user} is now a professional noise generator. Say hello to **{role}**. No refunds on earplugs.",
    "🔥 {user}'s ranting unlocked the **{role}** tier. The mic is permanently hot.",
    "🤯 {user}'s blabber has transcended mortal limits. Ascended to **{role}**.",
    "📡 {user}'s sound waves got picked up by satellites. Signal boost: **{role}** unlocked.",
    "🍕 {user} kept rambling until we fed them a **{role}** with extra toppings.",
    "🚨 Alert: {user} has become **{role}**. Seek shelter immediately.",
    "🔊 {user} reached **{role}** status. Their mute button no longer works.",
    "📈 {user}'s nonsense broke the graph. Congratulations on **{role}**, noise investor.",
    "🪄 {user} summoned **{role}** using verbal spellcasting. Hogwarts is jealous.",
    "🧽 {user} soaked up every opportunity to talk. Awarded the **{role}** sponge trophy.",
    "🏆 {user} now holds the **{role}** award for Outstanding Volume Performance.",
    "😎 {user}'s words dripped with sauce. They've officially become **{role}**.",
    "💬 {user} made more soundwaves than a podcast. Welcome to **{role}**, content machine.",
    "🔁 {user} entered a loop of noise. Promoting to **{role}** just to stop it (we hope).",
    "👑 {user} now wears the crown of clamor. Long live **{role}**.",
    "🧨 {user}'s commentary caused a server meltdown. Now operating as **{role}**.",
    "🐦 {user} tweeted their way to greatness. Flight status: **{role}**.",
    "🤖 {user}'s speech pattern confused the bots. Promoted to **{role}**, glitch wizard.",
    "🎩 {user} argued in cursive. Promoted to **{role}** by the Queen’s decree.",
    "💥 {user} detonated a paragraph in chat. Role updated: **{role}**. RIP peace.",
    "🦜 {user} chirped nonstop. Even the parrots complained. Welcome to **{role}**.",
    "👂 {user}'s vocal power can pierce titanium. Say hello to **{role}**.",
    "🔮 {user}'s blabbering awakened ancient spirits. They now whisper ‘**{role}**’.",
    "🎮 {user} trash talked their way to the top. Level up: **{role}** unlocked.",
    "📚 {user} wrote a trilogy in chat. Author name: **{role}**.",
    "🛸 {user}'s noise attracted aliens. First contact initiated: **{role}**.",
    "🥇 {user} beat the loudest auctioneer in a voice duel. Winner: **{role}**.",
    "💤 {user} even talked in their sleep. Promotion unlocked: **{role}**.",
    "🌪️ {user}'s words summoned a storm. Status: **{role}**. Weather warning issued.",
    "🧏 {user} made a mime speak out loud. That's **{role}** energy.",
    "🎧 {user}'s noise is now an album. Dropped on Spotify: **{role}** vibes only.",
    "👾 {user}'s chatter has corrupted the matrix. New role: **{role}** glitch overlord.",
    "🥁 {user} rambled a drum solo. Role unlocked: **{role}**. Encore pending.",
    "🧊 {user} froze the chat with savage takes. New title: **{role}**.",
    "🐝 {user} buzzed into high society. Welcome to the **{role}** hive.",
    "🚽 {user} talked so long, we renamed the voice chat to Bathroom. Enjoy **{role}**.",
    "☠️ {user}'s voice scared the skeletons. Graveyard certified: **{role}**.",
];
exports.roleDemotionMessages = [
    "📉 {user} spoke too little. Stripped of **{oldRole}**, now crawling back as **{newRole}**.",
    "🔕 {user} activated silent mode. From **{oldRole}** down to humble **{newRole}**.",
    "🪫 {user} ran out of vocal charge. **{oldRole}** ➝ **{newRole}** like a dead battery.",
    "🤐 {user} zipped it too tight. Bye-bye **{oldRole}**, hello **{newRole}**.",
    "🎤 {user} dropped the mic… and the rank. **{oldRole}** downgraded to **{newRole}**.",
    "📦 {user}'s noise levels got boxed up. From **{oldRole}** to **{newRole}** express shipping.",
    "😶 {user} became a whisper in the wind. Demoted from **{oldRole}** to **{newRole}**.",
    "🛬 {user} crash-landed from **{oldRole}** down to **{newRole}**. Brace for cringe.",
    "🧂 {user} lost the flavor. **{oldRole}** is gone, bland life as **{newRole}** begins.",
    "🎭 {user} closed the curtain. **{oldRole}** retired, now performing as **{newRole}**.",
    "📉 {user}'s chatter stock plummeted. **{oldRole}** sold off, holding **{newRole}** now.",
    "🧼 {user} got cleaned out of their power. Scrubbed from **{oldRole}** to squeaky **{newRole}**.",
    "🎧 {user} got unplugged. **{oldRole}** left the playlist, welcome **{newRole}** to lo-fi obscurity.",
    "🌑 {user}'s signal faded to black. Once **{oldRole}**, now just a **{newRole}** echo.",
    "🧊 {user} froze mid-sentence. **{oldRole}** cracked, demoted to **{newRole}**.",
    "🪛 {user} broke their voice gears. Repaired at **{newRole}**, scrapped from **{oldRole}**.",
    "📺 {user} switched off the volume channel. **{oldRole}** cancelled, binge-watching as **{newRole}**.",
    "🪦 {user}'s voice buried in chat history. **{oldRole}** tombstoned, resurrected as **{newRole}**.",
    "👂 {user} heard too much and said too little. **{oldRole}** removed, reissued as **{newRole}**.",
    "🎮 {user} rage-quit the loud game. Lost **{oldRole}**, respawned at **{newRole}**.",
    "🎯 {user} missed their volume target. **{oldRole}** revoked, nerfed to **{newRole}**.",
    "🛸 {user}'s signal got intercepted. Beamed down from **{oldRole}** to Earth-level **{newRole}**.",
    "🤖 {user} entered sleep mode. **{oldRole}** archived, rebooted as **{newRole}**.",
    "📪 {user}'s voice mail returned empty. **{oldRole}** bounced, settled for **{newRole}**.",
    "🫥 {user} turned invisible in chat. From **{oldRole}** to ghost-tier **{newRole}**.",
    "💿 {user} scratched the audio. **{oldRole}** unplayable, downgraded to **{newRole}** format.",
    "🥀 {user} wilted mid-rant. **{oldRole}** withered away, replaced with **{newRole}**.",
    "🫗 {user} leaked too much silence. Demoted from **{oldRole}** to dripless **{newRole}**.",
    "🎢 {user}'s voice rollercoaster took a dip. **{oldRole}** to **{newRole}** with zero Gs.",
    "🚽 {user}'s commentary flushed itself. Down from **{oldRole}** into **{newRole}** waters.",
    "📚 {user} closed their chapter. End of **{oldRole}**, new book starts with **{newRole}**.",
    "🐢 {user} slowed their speech to a crawl. **{oldRole}** stepped down, **{newRole}** steps in.",
    "🌪️ {user} ran out of wind. **{oldRole}** blown away, now calm as **{newRole}**.",
    "🧽 {user} absorbed too much silence. Demoted from **{oldRole}**, now scrubbing as **{newRole}**.",
    "🔮 {user}'s prophecies got muffled. **{oldRole}** revoked, now whispering as **{newRole}**.",
    "🥶 {user} cooled down hard. Icy drop from **{oldRole}** to **{newRole}**.",
    "🧏 {user} got quiet even for a mime. **{oldRole}** gone, demoted to **{newRole}** hush tier.",
    "🚫 {user} hit max silence. Auto-demoted from **{oldRole}** to **{newRole}**.",
    "🫧 {user} faded into background bubbles. **{oldRole}** popped, now floating as **{newRole}**.",
];
exports.darkBackgroundColors = [
    "#0d1117", // GitHub dark
    "#1a1a1a", // Neutral dark
    "#18191c", // Discord dark
    "#101820", // Deep blue-gray
    "#1e1e2e", // Midnight violet-gray
    "#121212", // Android dark theme
    "#1c1f26", // Soft black
    "#141d26", // Bluish black
    "#23272a", // Discord's sidebar
    "#2c2f33", // Discord's classic background
    "#202225", // Discord dark gray
    "#1b1b2f", // Dark navy
    "#161b22", // GitHub code background
    "#0e0e10", // Twitch background
    "#2f3136", // Discord chat background
];
exports.lightBackgroundColors = [
    "#ffffff", // Pure White
    "#fdfdfd", // Almost White
    "#fcfcfc", // Soft White
    "#fafafa", // Light Grayish White
    "#f8f8f8", // Subtle Off-White
    "#f5f5f5", // Smoke White (CSS: Whitesmoke)
    "#f2f2f2", // Very Light Gray
    "#f0f0f0", // Neutral White-Gray
    "#eeeeee", // Pale Gray
    "#ebebeb", // Warm Gray Tint
    "#eaeaea", // Muted Light Gray
    "#e8e8e8", // Gentle Grayish White
    "#f6f8fa", // GitHub Background White
    "#edf2f7", // Tailwind 'gray-100'
    "#f7f7f7", // Light Gray White
];
exports.rolePromotionGifs = [
    [""],
    [
        "https://media.tenor.com/kJS0W9pqUDQAAAAM/lurking-creeping.gif",
        "https://media.tenor.com/TbKly4oJOBgAAAAM/anthony-anderson-looking.gif",
        "https://i.gifer.com/GRDF.gif",
        "https://media.tenor.com/ulfWwhYQGIgAAAAM/sal-lurking-sal-lurk.gif",
        "https://media.tenor.com/Py3PtpNEJJ0AAAAM/cat-lurking.gif",
        "https://media.tenor.com/TkagZnznpgkAAAAM/cat-lurk.gif",
        "https://media.tenor.com/hgIQRlT2crUAAAAM/brody-wellmaker.gif",
        "https://media2.giphy.com/media/OCOYbqiXzkxMI/200w.gif?cid=6c09b952jk1a0azl53x64ns8fy6jeoht7j93jwdom4xglwq9&ep=v1_gifs_search&rid=200w.gif&ct=g",
    ],
    [
        "https://media.tenor.com/MDxs9sUkJ_AAAAAM/wizard-dance.gif",
        "https://media.tenor.com/iCFNj4B9zQUAAAAM/dwight.gif",
        "https://media.tenor.com/xXNYv9q9HZEAAAAM/stan-twitter-leobylaw.gif",
        "https://i.imgur.com/xBZ0WMz.gif",
        "https://www.hubspot.com/hs-fs/hubfs/receiving%20redundant%20phone%20calls.gif?width=480&height=269&name=receiving%20redundant%20phone%20calls.gif",
        "https://media.tenor.com/JJ_is357rXYAAAAM/spike-monkey-typing.gif",
    ],
    [
        "https://i.pinimg.com/originals/88/10/64/881064cfb0167713e5b726335f7ae23f.gif",
        "https://64.media.tumblr.com/af30c5f46a6554063a71f9d105cc588b/tumblr_p9j0mn85mu1rrkahjo1_540.gifv",
        "https://64.media.tumblr.com/35ebcb06d0f8779378f613abf9bc1558/b329276fd89b8684-cf/s500x750/c1dadb37f033e59e7d5d4d6e9850ff529c6d15a6.gif",
        "https://media.tenor.com/gTqRGv4QTfgAAAAM/onimaki-dance-goblin-dance.gif",
        "https://media1.giphy.com/media/1AISoIppa3sYmbFZY0/giphy.gif",
    ],
    [
        "https://media.tenor.com/iCqG_iT-h48AAAAM/bills-ugh.gif",
        "https://media.tenor.com/1MSxCprd3MgAAAAM/working.gif",
        "https://media.giphy.com/media/XIqCQx02E1U9W/giphy.gif",
        "https://i.pinimg.com/originals/4a/e5/d5/4ae5d5d0b85a157c6dac7f6a17bb3078.gif",
        "https://i.makeagif.com/media/5-26-2015/DkgsXO.gif",
        "https://media.tenor.com/dPLWf7LikXoAAAAM/typing-gif.gif",
        "https://media.tenor.com/rSV4dN-HOboAAAAM/typing-keyboard.gif",
        "https://i.makeagif.com/media/5-26-2015/DkgsXO.gif",
    ],
    [
        "https://cdn.mos.cms.futurecdn.net/Z7Rv4K4aVfzDzJnHPJXPF8.gif",
        "https://codaio.imgix.net/docs/4IMyNAs4pF/blobs/bl-8D8x1g0Vjh/740de5d14aba235bc82ca6fb7636782cd8cf625e59b394351437d720e4925cd27ac5b519cad104c29e813f1a7aa7324f130add2c31496a30ec63ea7fe0fec6a6cce82787b8aaf3d4ca59488d11bf2fc129feb59c6c0dd7a73cf381a78a14963673d44d6c?fit=crop&ar=1.91%3A1&fm=jpg",
        "https://media.tenor.com/CbWKthhbhEoAAAAM/insane-fast-typing-cat.gif",
        "https://media.tenor.com/M-WzFWCPVHsAAAAM/guy-typing-typing.gif",
    ],
    [
        "https://media.tenor.com/rCsC_pOIquQAAAAM/cage-priest.gif",
        "https://media.tenor.com/j_X4pXUKVJkAAAAM/face-off-faceoff.gif",
        "https://i.gifer.com/ERqp.gif",
        "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZzJwN3ptYXE2d3JqcnF1cGY2ZWJnMzU5NmQ2bHd5cTR3cHM3NXoxbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/CpcpDSci3ljCU/giphy.gif",
        "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHlldTJoeHBsYXB3YXNqc295NDdpYzFmNGl5cHRvZDdlanA1ZXZqOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3ohs7Rl6L4zG2rvHoc/giphy.gif",
    ],
    ["https://media.tenor.com/jSakpprrHBEAAAAM/shrek-smirk.gif"],
    [
        "https://media.tenor.com/-2V6pcNfhpMAAAAM/homer-simpson-levitating.gif",
        "https://media.tenor.com/2q7RCZAr-4gAAAAM/ascending-energy.gif",
        "https://media.tenor.com/qU7kKSP7JgsAAAAM/big-brain-lateralus.gif",
        "https://media.tenor.com/cX60Qs5wNN8AAAAM/vine-ascend.gif",
        "https://media.tenor.com/v05kjibQ_ZQAAAAM/ascend-winnie-the-pooh-ascend.gif",
    ],
];
// export const sampleUsers: IUser[] = Array.from({ length: 55 }, (_, i) => {
//   const xpPerDay = new Map<string, number>();
//   // Generate XP for the last 40 days
//   for (let d = 0; d < 40; d++) {
//     const date = new Date();
//     date.setDate(date.getDate() - d);
//     const formatted = date.toISOString().split("T")[0]; // 'YYYY-MM-DD'
//     xpPerDay.set(formatted, Math.floor(Math.random() * 100)); // Random XP 0–99
//   }
//   const textXp = Math.floor(Math.random() * 2000);
//   const voiceXp = Math.floor(Math.random() * 3000);
//   const totalXp = textXp + voiceXp;
//   return {
//     userID: `10000000000000${i + 1}`,
//     username: `User${i + 1}`,
//     nickname: `CoolUser${i + 1}`,
//     serverID: "123456789012345678",
//     leveling: {
//       xp: Math.floor(Math.random() * 1000),
//       textXp,
//       voiceXp,
//       totalXp,
//       xpPerDay,
//       level: Math.floor(Math.random() * 20) + 1,
//       lastMessageTimestamp: new Date(Date.now() - Math.random() * 1000000000),
//       lastPromotionTimestamp: new Date(Date.now() - Math.random() * 1000000000),
//       currentRole: "",
//     },
//     giveaways: {
//       isBanned: false,
//       giveawaysEntries: [],
//       giveawaysWon: [],
//     },
//   };
// });
exports.leaderboardThumbnail = path_1.default.resolve(__dirname, "../assets/logos/rainbow_logo.png");
exports.farewellMessages = [
    `Notice: <@{userId}> has officially left the halls of Skyhaven. There was no farewell speech, no teary goodbyes, and definitely no loot drop. Just a clean exit into the unknown. Their chair is now cold. Their emojis, expired.`,
    `Update from the system: <@{userId}> has been removed from the guild roster. Their belongings have been digitally boxed, their permissions revoked, and their ping trail erased from existence. May their next server bring better luck with RNG.`,
    `The winds shift in Skyhaven as <@{userId}> disappears from our list of active members. No confetti was thrown. No banners were raised. But somewhere, a guild member just sighed in relief at one fewer notification.`,
    `Guild memo: <@{userId}> has exited the server. Whether they rode off into the pixelated sunset or were escorted out by unseen hands, we can’t say. All we know is that their spot on the roster is now available for rent.`,
    `<@{userId}> is no longer with us in Skyhaven. Their departure was swift, their impact... classified. The guild bot sheds no tears. But their empty slot echoes faintly with the sound of unread pings.`,
    `Let it be recorded in the scrolls of Skyhaven: <@{userId}>'s time among us has ended. Their final act? A silent logout. Their legacy? Probably lost to cache refresh. But their memory lives on, at least until the next server restart.`,
    `Guild logs confirm the departure of <@{userId}>. They left behind no farewell message, no guild tax, and no sense of closure. But we respect a clean exit. Quiet. Efficient. Like a ninja uninstalling Discord.`,
    `<@{userId}> has departed Skyhaven. There was no dramatic exit cutscene, no suspicious explosion — just a standard disconnect and a mild reduction in server chaos. We assume the mods survived.`,
    `System report: <@{userId}> has left the server. Their data trail has been vacuumed, their roles unassigned, and their digital soul returned to the aether. If you see them again, it’s probably an alt.`,
    `One moment they were here, the next — gone. <@{userId}> has exited Skyhaven with minimal disturbance and maximum mystery. The cause of departure? Unspecified. The result? One fewer “hi” in general chat.`,
    `Effective immediately, <@{userId}> has been removed from the Skyhaven guild registry. Their code is no longer part of the simulation. Please do not attempt to summon them using mentions, rituals, or carrier pigeons.`,
    `This just in: <@{userId}> has been removed from the server. No need for panic — the member was stable, the logs are clean, and the bots haven’t revolted. We’ll just pretend they were never here... unless you have screenshots.`,
    `Guild integrity remains stable. <@{userId}> has disconnected. No fireworks were triggered. No memory leaks detected. Their emoji usage has been safely contained and deleted. We move on.`,
    `Please be advised: <@{userId}> has vacated the premises. We checked their inventory — no guild funds were taken. The chair they left behind has been blessed by the admin team for future use.`,
    `<@{userId}>'s time in Skyhaven has come to an end. Their access card has been revoked, and their guild ID retired. If they attempt to return via secret alt, our detection owls are standing by.`,
    `Guild departure recorded: <@{userId}> has officially left the server. Whether through quiet departure or abrupt yeeting, their space is now open for another adventurer with questionable fashion choices.`,
    `The archives now reflect <@{userId}>'s departure from Skyhaven. Their tab at the tavern has been closed, their quests auto-failed, and their contribution to guild chaos quietly archived.`,
    `<@{userId}> has disappeared from Skyhaven. The echo of their last message still lingers, and someone in #memes cried a single pixelated tear. We shall continue... with one fewer emoji reaction.`,
    `We interrupt your scrolling to announce: <@{userId}> is no longer part of this server. No plot twists, no end credits — just a silent fade to offline. Please direct all farewell emotes to the nearest reaction bar.`,
    `With this final update, <@{userId}> is no longer in Skyhaven. Their seat has been unassigned, their notifications turned to dust, and their legacy… well, that depends on the screenshots you saved.`,
];
exports.giveawayStartMessages = [
    "Alchemia gods are feeling generous 🎁 Grab your luck before it resets!",
    "A stray boss just exploded in Sofya 💥 — loot’s flying, react fast!",
    "You’ve farmed Venena 400 times, now try farming luck 🎲 in this giveaway!",
    "A Blacksmith accidentally gave away their best gear ⚒️ Wanna claim it?",
    "This giveaway is rarer than a slot in a 2s Lil Empress Bow 👑",
    "An NPC misplaced their legendary drop 📦 React now before it’s repossessed!",
    "We found a treasure chest in the middle of Hora Diomedea 🗺️ Wanna peek inside?",
    "Someone fused their gear wrong and dropped this instead 😬 Lucky you!",
    "No need to farm mini bosses 12 hours today — just enter this giveaway 🔥",
    "The consignment board crashed, but this item is still available 🧾 For free.",
    "Some adventurer rage quit and left their loot behind 😭 Finders keepers!",
    "Rumor has it this prize was blessed by Pino herself 🧝‍♀️",
    "You’ve dodged Red Zones, but can you dodge bad luck? Enter to test 🎯",
    "Your party member rolled this drop — but you can steal it here 🤫",
    "A wandering merchant is giving away their goods 😎 Act before they vanish!",
    "Who needs 10K Spina when you can get this for reacting 💸",
    "This item is shinier than a full stack of Magic Marionette Cores 💎",
    "Giveaway alert: no farming, no RNG, no potions — just react and hope 🍀",
    "This might not be a Lucky Gem... but it might be luckier 💫",
    "A rare dye just fell out of the sky 🎨 Be the first to grab it!",
    "Forget Venena, this is the real DPS test — Damage Per Swipe 🤌",
    "The Mononofu gods demand a winner 🥷 Are you worthy?",
    "An AOE skill cleared the chat and left this behind 😳",
];
exports.boostMessages = [
    `✨ <@{userId}> just offered a rare orb to the Server Spirit!  
  Legends say when an adventurer boosts, a Potum sheds a tear of joy, a Venena loses 1 DEF, and someone finally drops a 2s weapon after 7 years.  
  Thank you, brave soul — the land of Toram shines brighter today.`,
    `🗡️ With a swift motion, <@{userId}> unsheathed their blade... and boosted the entire server!  
  As the stars realigned, everyone's stat points mysteriously increased.  
  Merchants started smiling, farmers got lucky, and even Zokzada gave a rare item with no complaints.  
  True power. True respect. Thank you for the boost, legend!`,
    `💎 The gods of Toram trembled...  
  <@{userId}> just unleashed a *Server Boost Lv.9999*!  
  A mysterious aura now surrounds the guild base — drop rates feel better, crafting success has risen, and even the bots in Rakau stopped for a moment of silence.  
  Your generosity will echo through time, adventurer.`,
    `🌀 “BOOST!” shouted <@{userId}> as they stood atop the walls of Sofya.  
  The wind howled, the chat lagged, and the boost was accepted by the ancient Discord core.  
  In return, the server gained +10 morale, +15 guild pride, and 1 extremely emotional Potum.  
  Thank you for the blessing, brave warrior.`,
    `🌠 A strange energy has filled the air...  
  <@{userId}> has boosted the server, and rumor has it their luck stat now permanently says "???".  
  If you suddenly feel happier, richer, and slightly better at dodging boss AOEs — now you know why.  
  Boost received. Gratitude transmitted. You are appreciated.`,
    `🧪 The alchemists of El Scaro whisper of this day —  
  <@{userId}> has performed the ancient ritual known as *Boostus Maximus*.  
  The result? Server-wide buffs, a mysterious glowing aura, and one extremely confused merchant shouting “S>Boost for luck” in chat.  
  Thank you for the power-up, friend.`,
    `🗨️ <@{userId}> didn’t just boost.  
  They struck the server with a Lightning Element Slash of Friendship +10.  
  In their honor, all Revita IVs now heal emotional damage too.  
  You didn’t have to go this hard, but you did. And we love you for it.`,
    `🍀 Somewhere deep in the Toram code, an RNG gatekeeper screamed.  
  <@{userId}> just boosted the server, and the luck stat cap has been broken.  
  Pets are dancing, bosses are dropping loot, and even LFP parties are less toxic.  
  This is a day to remember. Thank you, almighty booster.`,
    `🎁 A strange gift fell from the skies above Sofya...  
  <@{userId}>'s boost has triggered a rare event: “Server Vibes +100%”.  
  Expect smooth drops, fun convos, and 15 minutes of temporary peace between DPS mains.  
  Blessed be the booster.`,
    `🛡️ In a flash of light, <@{userId}> boosted the server — and the guild statues trembled.  
  Mochelo bowed respectfully. Venena smiled. Even King Piton admitted, “Yeah… they’re built different.”  
  Thank you, hero. The server stands taller because of you.`,
];
exports.welcomeMessages = [
    `⚔️ <@{userId}> has entered the world...  
  Quick! Someone teach them how to dodge AOEs before it's too late! 😵‍💫`,
    `🎉 <@{userId}> just spawned in Sofya, looked around, and joined the most elite server in Toram history.  
  Bad decisions start now — welcome! 😎`,
    `🌀 <@{userId}> has joined the party!  
  They're either here to make friends, farm Venena, or just ask “is 2s tradeable?” 15 times. 🤔`,
    `🍜 Welcome <@{userId}>!  
  Take a seat, grab some revitas, and enjoy the chaos. Toram’s weird, but we’re weirder. 🐢`,
    `🗡️ <@{userId}> just logged in.  
  Their starting class: Confused Wanderer.  
  Current quest: Figure out what this server is about. 🤖`,
    `🎭 <@{userId}> just stepped into the guild.  
  Minyu sensed a magical disturbance. Probably another mage rival... 🔮`,
    `🪓 <@{userId}> has joined the fray!  
  Yaze already pulled aggro on them. That halberd has no chill. 💢`,
    `💥 <@{userId}> logged in!  
  Barlydle flexed their top DPS spot. Expect sword swings and ego clashes soon. 🗡️`,
    `🧃 <@{userId}> appeared!  
  Erina is already prepping shields and juice boxes. Guild Mom energy. 🛡️✨`,
    `🔫 <@{userId}> just arrived.  
  Karma winked, reloaded, and whispered, “Another cute soul for the team~” 💖🔫`,
    `🎮 <@{userId}> entered the guild base.  
  Warning: may cause sudden laughter, questionable build advice, and an urge to farm minibosses at 3AM. 🌙`,
    `✨ <@{userId}> joined the server!  
  May their mana never run dry and their xtals always slot right the first time. 🙌`,
    `⚙️ <@{userId}> just arrived!  
  We gave them a rusty dagger, two revitas, and a dream. Welcome, traveler! 😤`,
    `📦 <@{userId}> opened a mysterious chest...  
  Inside was this server, a bunch of weirdos, and maybe some good advice. Welcome aboard! 🧙‍♀️`,
    `🧪 <@{userId}> drank a strange potion labeled "Join Server"...  
  They’re now permanently confused, slightly buffed, and 100% welcomed. 🍷`,
    `💀 <@{userId}> was last seen running into Boss Colon solo.  
  We tried to stop them. They said “I got this.” Welcome, brave soul. 🫡`,
    `🐄 <@{userId}> spawned near a Potum and tried to tame it.  
  It now owns them. Welcome to the server, property of the Potums. 🐾`,
    `🌸 <@{userId}> joined the server!  
  Meambles gasped. “Omg finally someone as cute as me?” 🌷💕`,
    `📈 <@{userId}> just spawned.  
  Von updated the guild spreadsheet. Efficiency never sleeps. 📊`,
    `💸 <@{userId}> entered the scene.  
  Edoras smiled gently and said, “Need gear? I’ll cover it.” 🤑`,
    `🗣️ <@{userId}> is here!  
  Goku immediately started a 20-message convo. You’ve been warned. 🎙️`,
    `🌪️ <@{userId}> just landed in the guild base.  
  Leve dual-slashed a dummy and yelled “Bet you can’t out-DPS me!” 🗡️🗡️`,
    `📜 <@{userId}> has accepted the quest:  
  “Survive Discord notifications without losing sanity.”  
  Reward: ???. Welcome, adventurer! 🤪`,
    `🧠 <@{userId}> joined with 0 INT, 0 STR, but 100% charisma.  
  They're not meta, but they're here. Welcome! ✨`,
    `🐉 <@{userId}> just entered the world, skipped the tutorial, and asked for dual swords.  
  Classic. Welcome aboard! ⚔️`,
    `🛑 <@{userId}> equipped a wooden sword, no armor, and walked into Venena.  
  Bold. Reckless. One of us. Welcome! 😂`,
    `🧱 <@{userId}> tried to tank Ultimate Mode in pajamas.  
  They failed. But we respect the energy. Welcome, legend! 💪`,
    `📊 <@{userId}> rolled a 1 on luck but a 100 on vibes.  
  May your drop rates improve and your Wi-Fi never lag. Welcome! 📶`,
    `🎭 <@{userId}> joined as a support.  
  We asked “which stat build?” They said “emotional support.”  
  We accept. Welcome! 🥲`,
    `📞 <@{userId}> just logged in... and immediately opened the trade menu.  
  Ah yes, another merchant has arrived. Welcome to Toramconomy! 💸`,
];
exports.raidMessages = [
    `**📯 THE RAID HORN HAS BEEN BLOWN — ALL HANDS ON DECK!**
The time has come once again, brave adventurers. 
Though there be no chests to plunder nor Spina to hoard, this battle will carve your name into the annals of guild history! The bosses await, smug and unbothered, and it's our divine duty to ruin their day.
Join us at <t:TIMESTAMP:F> and show them why we feared, revered, and occasionally pitied.`,
    `**🧩 GUILD RAID INITIATED: GLORY OVER GOLD**
This isn't your average dungeon crawl. No, this is a synchronized storm of questionable builds, scuffed strategies, and unmatched team spirit. The bosses won’t drop loot, but every second you survive (or don’t) is a contribution to the guild’s legacy.
Prepare your memes, potions, and backup excuses. We raid at <t:TIMESTAMP:F>. Attendance is not mandatory — it's legendary.`,
    `**🌪️ SUMMONING THE CHAOS — A RAID UNLIKE ANY OTHER**
The sky darkens. The wind howls. Chimera just updated his block list again. That can only mean one thing: we are raiding.
We don’t raid for loot. We raid because we have *absolutely nothing better to do*, and because guild progress doesn’t grind itself.  
Arrive at <t:TIMESTAMP:F>, preferably alive. Bring your worst ideas — we’ll make them work.`,
    `**💬 “WHY RAID IF THERE'S NO LOOT?” — A FOOL**
This is about more than shiny gear or RNG drops. This is about **legacy**, **loyalty**, and making sure that boss never mocks our lack of coordination again.
Join the frontline at <t:TIMESTAMP:F>. You may not walk away richer, but you’ll walk away a legend. Or crawl. Crawling is fine too.`,
    `**📅 GUILD MANDATE: TOTAL MOBILIZATION**
Once again, the Council of Probably-Bad Decisions has voted unanimously: It’s time for a raid.
There will be no loot. There will be no mercy. But together, we’ll face five of Toram’s nastiest bosses and raise our guild's name higher than your critical damage stat.
Show up at <t:TIMESTAMP:F>. Show off. Show heart.`,
    `**🛑 WARNING: NO REWARDS. JUST RESPECT.**
This raid is for the brave, the bold, and the ones who know gearscore is just a suggestion.
Progress is the only thing we’re collecting — well, that and stories of narrow escapes and totally intentional aggro pulls.
Join us at <t:TIMESTAMP:F>. Come for the progress, stay for the post-raid memes.`,
    `**🔮 THE PROPHECY HAS UNFOLDED — YOU'RE IN IT**
An ancient scroll foretold this day: five bosses would rise, and only one guild would have the audacity to show up without a proper plan.
There is no loot to be claimed. Only progress, pride, and possible emotional scarring.  
Raid begins at <t:TIMESTAMP:F>. Your fate awaits.`,
    `**🧠 THIS IS NOT A RAID. IT’S A SOCIOLOGICAL EXPERIMENT**
We’ve removed loot, and we’re still expecting you to show up. If that’s not peak guild loyalty, we don’t know what is.
Bosses await. The guild's future depends on your participation. So dust off your ego and report at <t:TIMESTAMP:F>.  
Let’s see who’s here for glory, not gear.`,
    `**🕊️ JOIN US — FOR THE LOVE OF THE GUILD**
This raid won't fill your pockets, but it *will* fill your soul with pride, your logs with deaths, and your guild’s scoreboard with EXP.
Even Chimera fears our determination. Or laughs at it. Either way, we’re pulling aggro at <t:TIMESTAMP:F>. Be there, or forever be known as “that one who bailed.”`,
    `**📉 PRODUCTIVITY DOWN. GUILD SPIRIT UP.**
Work? Sleep? Relationships? Irrelevant. The guild needs you.  
We fight not for loot, but for tradition, camaraderie, and the eternal satisfaction of watching a boss get absolutely clowned by 20 confused players.
Clock in at <t:TIMESTAMP:F>. Bring snacks and self-respect — you’ll need one of them.`,
    `**🍕 THIS RAID BROUGHT TO YOU BY BAD IDEAS AND PURE DETERMINATION**
No loot? No problem. We're fueled by vibes, voice chat chaos, and one healer who didn't sign up for this.  
Raid time is <t:TIMESTAMP:F>. Come contribute to guild progress... or at least the blooper reel.`,
    `**🪦 THERE ARE NO REWARDS, ONLY CONSEQUENCES**
Let’s not pretend this will be clean. We raid with style, not coordination.  
If you’re ready to spend an hour screaming at your screen and somehow call that “fun,” this one’s for you.
Assemble at <t:TIMESTAMP:F>. Don’t forget to hydrate.`,
    `**🏰 THE GUILD NEEDS YOU — EVEN IF YOUR DPS IS TRAGIC**
This is an all-call to guildies near and far. Bring your skills, your confusion, and your reckless optimism.
The bosses don’t drop loot, but they do drop to *teamwork, stubbornness, and mild peer pressure.*
Raid begins <t:TIMESTAMP:F>. Let’s show them why they nerfed us last patch.`,
    `**💼 CORPORATE SAYS IT’S TIME TO RAID**
Per guild HR: if you’ve missed the last 3 raids, this one is mandatory.  
Just kidding (unless it works). We raid for guild growth, community spirit, and the occasional heroic moment that *almost* went right.
⏰ Be there at <t:TIMESTAMP:F>, or risk being replaced by an NPC.`,
    `**🛠️ GUILD PROGRESS NEEDS GRIND, NOT GEAR**
You won’t walk away with loot, but you’ll walk taller, prouder, and possibly confused about how we pulled it off.  
This raid is the kind of chaotic beauty that Toram Online was made for.  
Starts at <t:TIMESTAMP:F>. Bring your faith in the cause.`,
    `**🎡 THE RAID CIRCUS RETURNS! NOW WITH 0% LOOT AND 100% HEART**
We are clowns. We are fighters. We are doing this for the guild and absolutely not because we forgot how normal MMOs work.
Your attendance means more than your stats ever could. See you at <t:TIMESTAMP:F>.`,
    `**🔗 EVERY RAID BUILDS A STRONGER CHAIN**
Each fight makes the guild stronger. Every participant is a link in that unbreakable bond (unless you disconnect).
We raid not for selfish gain, but collective strength. Be there at <t:TIMESTAMP:F>. Be the chain.`,
    `**👁️ THE BOSSES ARE WATCHING**
They think we won’t show because there’s no loot.  
They underestimate our stubbornness, our caffeine intake, and our ability to press random buttons with surprising effectiveness.
Prove them wrong at <t:TIMESTAMP:F>. Show them who we are.`,
    `**📜 LEGENDS ARE WRITTEN BY ATTENDANCE SHEETS**
This is how stories begin. The guild gathered. The bosses trembled. The game barely held together.  
And you? You were there.  
Write your name into the guild scrolls at <t:TIMESTAMP:F>. No loot needed.`,
    `**⚔️ The guild horn has been blown!**
No loot. No drops. Just your name etched into guild history.  
Show up, swing wildly, blame lag — as tradition demands.  
⏰ Raid begins at <t:TIMESTAMP:F>. Let’s make some progress... or memes.`,
    `**📣 RAID ALERT – Loot? Nah. Legacy? YES.**
This isn’t about what you get. It’s about what we become.  
The bosses won’t drop anything, but your effort drops guild EXP.  
Join the fight at <t:TIMESTAMP:F> – don’t let the guild down (again).`,
    `**🐗 BOSS SPOTTED – BRING YOUR WORST**
This is a raid where nobody gets loot, but everybody gets trauma.  
Perfect time to test your "definitely not meme" build.  
We start at <t:TIMESTAMP:F>. Don’t be the last one to die.`,
    `**🔥 GUILD RAID – THE SPIRIT OF TORAM LIVES**
We fight for glory, rankings, and the chance to screenshot your 1HP survival moment.  
🕓 Time: <t:TIMESTAMP:F>  
Gear? Optional. Vibes? Mandatory.`,
    `**🧙‍♂️ El Scaro’s Sage says: “Raid today, flex forever.”**
Join your guildmates in battle. No loot. Just honor, chaos, and mild yelling.  
Raid launches at <t:TIMESTAMP:F> – bring that legendary spirit (and maybe a revive crystal).`,
    `**🏹 THIS IS A RAID, NOT A FARM**
There are no drops. No Spina. Only progress and pride.  
This is where real guilds are forged – in lag and AoE fire.  
⏰ Mark the time: <t:TIMESTAMP:F>`,
    `**🧻 WANTED: 1 Healer, 3 DPS, 17 Emotional Support Members**
Progress doesn't earn itself.  
Whether you're useful or just funny in VC, we need you.  
🎯 Raid starts at <t:TIMESTAMP:F>. Let’s make this painful and worth it.`,
    `**🔔 Raid bells are ringing, but not for loot**
Toram’s bosses have returned from vacation.  
Our job? Politely evict them with violence.  
⏳ Assemble at <t:TIMESTAMP:F> – no drops, just dominance.`,
    `**📊 Guild Progress Report: You’re the Missing Variable**
We need bodies. Preferably yours.  
Come raid for the glory, stay for the screenshots.  
Raid kicks off at <t:TIMESTAMP:F>. Don’t forget your ~shiny~ nonfunctional gear.`,
    `**🎬 WELCOME TO “Toram’s Got Trauma”**
You, five bosses, and one raid where everyone pretends to know mechanics.  
Reward: Guild reputation and a possible feature in “Fails of the Week.”  
🎮 We begin at <t:TIMESTAMP:F>`,
    `**⚡ RAID TIME – BETA TEST YOUR DIGNITY**
Your contribution = +1 to the guild’s power, -10 to your sanity.  
Join the mob at <t:TIMESTAMP:F>. Rage optional. Results guaranteed.`,
    `**💪 The Guild Rises, Lootless but United**
We don’t raid for shinies. We raid for status.  
Be part of the wave that makes us unstoppable.  
🕒 Launching raid at <t:TIMESTAMP:F>`,
    `**🚫 This Raid Has No Drops. Only Dreams.**
Dreams of victory. Dreams of wiping less than last time.  
You bring the power, we’ll bring the bosses.  
Let’s progress together. ⏰ <t:TIMESTAMP:F>`,
    `**🎖️ GUILD CALL TO ACTION!**
No drops. No excuses.  
This is for progress, pride, and ping spikes.  
Raid commences at <t:TIMESTAMP:F>. Bring your A-game or at least your keyboard.`,
    `**🥲 Still no loot? Still raiding.**
Why? Because we believe in this guild, not in RNG.  
Show up at <t:TIMESTAMP:F> to prove you care more than your DPS meter.`,
    `**🎆 SPECIAL EVENT: Emotional Damage x Progress Boost**
Come witness the raw power of 20 confused adventurers vs 1 smug boss.  
Join us at <t:TIMESTAMP:F>. No drops. Just legendary laughs.`,
    `**👑 Become the Lore**
No one remembers the loot. They remember who showed up.  
Make your mark at <t:TIMESTAMP:F> and become part of our saga.`,
    `**⚰️ You Will Die. But the Guild Will Grow Stronger.**
That’s the kind of trade-off we love.  
Bring your courage and questionable builds to <t:TIMESTAMP:F>`,
    `**🔗 Raid Night: Chains of Commitment**
You're not raiding for loot—you're raiding because your guildmates believe in you.  
Also because we threatened to make you support next week.  
⏰ <t:TIMESTAMP:F>`,
    `**🐉 WARNING: Boss May Be Stronger Than Your Self-Esteem**
But that’s fine—we're here to laugh, fail, and still get guild points.  
Join the crusade at <t:TIMESTAMP:F> – no gearscore checks, just good vibes.`,
    `**⚔️ Calling All Misfits and Meta-Chasers!**
The bosses have respawned and they're angrier than your pet after five missed feeds.
Our scouts spotted them near the ruins of El Scaro, mumbling something about “nerf tanks” and “where’s my drop rate buff.”
Now’s your chance to make your build finally *mean something*.

We ride at <t:TIMESTAMP:F> — or we die to AoEs again. Probably both.
Contribute to the guild’s progress and eternal bragging rights.`,
    `**🧙‍♂️ Legendary Guild Raid Approaches!**
Sofya’s Magic Council is panicking. The alchemists are crying. The merchants are selling “anti-death potions” that are just apple juice.

Only one force can tip the balance: **Skyhaven**.  
And no, this time you won’t be raiding for loot—you’ll be fighting for **honor**, **guild prestige**, and **the right to yell "EZ" in GC**.

Raid begins: <t:TIMESTAMP:F>. Be there or be demoted to fish bait duty.`,
    `**🔥 RAID ALERT! ALL HANDS ON DECK!**
A call to arms has echoed through the Guild Hall. No loot awaits, but glory does.

This isn’t about gear. This is about **legacy**. Every boss you defeat builds our guild’s strength, reputation, and contribution to Toram’s guild ranking system. (Or at least that’s what we tell the newbies.)

Show up, swing hard, and scream louder. <t:TIMESTAMP:F>. You know what to do.`,
    `**📢 ATTENTION, GLORY-SEEKERS!**
A raid event is underway! What’s in it for you? Not drops. Not Spina. Just the warm feeling of carrying your guild’s name through the battlefield like a sweaty, laggy banner.

Bosses: Mad.
Tanks: Questionable.
Outcome: Progress.

Meet us at <t:TIMESTAMP:F>. Your guild needs every swing, spell, and sarcastic comment you can muster.`,
    `**🎯 MISSION: GUILD DOMINANCE**
Forget loot. This is for the charts. The board. The recognition that makes new members say, “Oh wow, I saw your guild in Rakau Rankings!”

Every boss downed is another tally toward our dominance.

Are you:
✔️ Willing to suffer AoEs?  
✔️ Ready to fight with zero drops?  
✔️ Still proud enough to show up?

Join us at <t:TIMESTAMP:F>. Progress doesn't happen without pain.`,
    `**👑 THE HONORABLE GUILD RAID COMMENCES**
This isn’t your average dungeon crawl. This is an official raid under the Guild’s banner.

There will be:
• No rewards  
• No mercy  
• No excuses

What it will have:
• Maxed effort  
• Stressed support mains  
• +1 progress for the guild leaderboard

Suit up. Log in. Stand tall. <t:TIMESTAMP:F>. Don’t make the NPCs do it for you.`,
    `**⚡ TORAM'S NEXT CHAPTER WRITTEN IN RAID**
No shiny loot? No problem. We raid for something shinier: **our guild’s legacy**.

Be part of the battle that gets us mentioned in Sofya’s gossip NPCs.  
Be the reason our guild emblem is whispered in fear by Bison spawn.

🗓️ <t:TIMESTAMP:F>  
Your build doesn’t have to be perfect. Just your **attendance**.`,
    `**💢 NO LOOT, NO PROBLEM. STILL RAIDING.**
You heard right. This one’s for the guild. The XP. The rankings. The feeling of finishing a raid and knowing your effort mattered—like... actually mattered.

Still coming? Good. We’re counting on you, warrior.  
Raid goes live <t:TIMESTAMP:F>. Bring fire. Bring friends. Bring that spirit.`,
    `**🛡️ BRING GLORY TO SKYHAVEN**
No boss is too tough. No motivation is too small. Even without loot, our name will rise.

Join the formation, clash blades, and make sure the enemy knows: **this guild fights together.**

Start time: <t:TIMESTAMP:F>  
Let’s raid like legends—even if all we get is a line on a spreadsheet.`,
    `🛡️ The guild banner flutters once more in the crisp morning air. 
Meambles, radiant in her perfectly coordinated outfit, tightens her grip on her shield — ready to tank, look cute, and maybe die for the cause. 
Pinku stands beside her, casually juggling support buffs and DPS gear like it’s no big deal. 
There’s no loot this time, only contribution to the sacred guild progress bar. 
We ride at <t:TIMESTAMP:R>.`,
    `⚔️ Yaze already pulled aggro — and the boss hasn’t even spawned yet. 
With his halberd raised high, he radiates pure unfiltered violence. 
Rauk, meanwhile, meditates in the corner, mumbling about “frame-perfect counters” and “katana superiority.” 
Together, they form the perfect storm of overconfidence. 
The raid begins <t:TIMESTAMP:R>. Prepare accordingly.`,
    `✨ Minyu has lit the ground on fire. 
Not metaphorically — she actually dropped a Fire Lance in spawn for dramatic effect. 
Toro walks in late, fiddling with his one-handed sword and magic device combo that no guide recommends, but somehow still works. 
Will we survive? Maybe. Will it be stylish? Absolutely. 
Join the madness <t:TIMESTAMP:R>.`,
    `💥 Barkydle is already stretching his shoulders — you know what that means: 
another raid, another attacker rank farmed like wheat in Sofya. 
Leve, swinging his dual swords while yelling “SAO style!”, claims this is the time he outdamages Barky. 
It’s not about loot. It’s about vengeance and validation. 
Be there <t:TIMESTAMP:R>.`,
    `🌈 Karma arrives 10 minutes late, bowgun on shoulder, glowing with chaotic femboy vibes. 
Edoras stands beside him, tossing 100k spina into the guild fund like spare change. 
The aura is immaculate, the damage will be nuclear, and the loot nonexistent. 
It’s time to flex, die fabulously, and earn meaningless points. 
Raid begins <t:TIMESTAMP:R>.`,
    `🧙 Erina has once again assumed her role as guild mom, raid tank, and emotional support system all in one. 
Thinkpitz hovers ominously nearby, his buffs already active before the battle even begins. 
With this duo leading the charge, even the server lag trembles. 
No drops, no excuses — only results. 
We begin <t:TIMESTAMP:R>.`,
    `😢 Somewhere in the quiet before the raid, someone whispers: “Incipiencibus…” 
Though he hasn’t logged in for centuries, his ghostly presence fuels us still. 
Goku, unaware of the solemn moment, yells about what he ate for lunch in VC. 
The raid begins <t:TIMESTAMP:R> — whether you’re nostalgic, chatty, or both, you belong here.`,
    `🎯 Seravon has been on standby since yesterday, arrow drawn and eyes locked. 
He says nothing, only nods. 
Von appears briefly to say, “Fine, I’ll participate this time,” before vanishing again into admin duties. 
This is the kind of emotional rollercoaster your therapist warned you about. 
Brace yourself — <t:TIMESTAMP:R>.`,
    `🎆 Nino swears he's still young and ready for action, despite accidentally trying to buff himself with a cooking recipe. 
Ayu brings in a platoon of tuyuls and claims they’re “strategic assets.” 
No one has the heart to say no. 
It’s pure Toram madness, and it begins <t:TIMESTAMP:R>.`,
    `🌀 Toro insists his hybrid build is “meta-adjacent.” 
Karma, now perched on a magic broomstick for dramatic flair, simply smiles and says, “Just watch me.” 
Expect flair, drama, and possibly unintentional PvP. 
We start <t:TIMESTAMP:R>.`,
    `🧚‍♂️ Meambles showed up in her newest outfit, looking like a fairytale boss herself. 
Pinku has already composed an anthem for this raid and is rehearsing it mid-combat. 
We may not win fast, but we’ll do it fabulously. 
Raid drops <t:TIMESTAMP:R>.`,
    `🗡️ Leve posted a screenshot of his sword with the caption “Skill > Stats.” 
Rauk replied with a 4-paragraph essay on katana superiority. 
Tension is high. 
Only one can win top attacker — but both will win your heart. 
Join in <t:TIMESTAMP:R>.`,
    `💎 Edoras casually asked if the guild needs another 5 million spina for “raid snacks.” 
Minyu, levitating slightly with magical energy, replied, “Only if you want extra buffs.” 
This is a team that raids with style and wallets. 
Countdown begins <t:TIMESTAMP:R>.`,
    `🎤 Goku is already narrating the battle before it begins, complete with sound effects and unnecessary commentary. 
Von sighs quietly and opens the raid channel, muttering something about “responsibility.” 
Together, they are chaos and order. 
The raid begins <t:TIMESTAMP:R>.`,
    `🎽 Yaze is doing pushups in the waiting room to “psych up.” 
Meanwhile, Toro is calculating damage formulas that even the devs don’t understand. 
Whatever happens, it’ll be legendary — or at least meme-worthy. 
Join <t:TIMESTAMP:R>.`,
    `🎀 Meambles and Karma walk in side by side — one a glowing tank of cuteness, the other a radiant menace with glitter and gunpowder. 
Nobody knows what the strategy is, but everyone agrees it will be fabulous. 
Be there <t:TIMESTAMP:R>.`,
    `🌟 Pinku is already buffed, healed, and somehow top DPS, all while complimenting everyone’s outfits. 
Leve is still loading in, practicing his ultimate combo in town. 
The raid may not have loot, but it will have screenshots. 
Starting <t:TIMESTAMP:R>.`,
    `🕊️ ARainA calmly checks gear, stats, and strategy documents. 
Yaze bursts into the channel yelling “AGGRO TIME.” 
This is fine. Everything is under control. Probably. 
Meet at <t:TIMESTAMP:R>.`,
    `🔮 Thinkpitz cast buffs so early, no one knew the raid was even scheduled. 
Barkydle sharpened his sword so hard it cut through voice chat. 
It’s going to be bloody, beautiful, and entirely boss-free of loot. 
Let’s go <t:TIMESTAMP:R>.`,
    `🍵 Nino brings snacks. Ayu brings tuyuls. 
That’s the kind of raid composition we’re working with. 
If you came for structure, you’re in the wrong guild — but if you came for chaos-driven success, welcome home. 
Join the fray <t:TIMESTAMP:R>.`,
];
exports.serverBoostMessages = {
    serene: [
        `As your boost shimmered into the server, <@{userId}>, I felt the wind pause — as if Skyhaven itself sighed in relief.  
  The petals by the Guild Altar began to glow softly 🌸. I lit incense and whispered a quiet prayer in your honor.`,
        `<@{userId}>, your boost flowed through the realm like the gentle waters of Aulada.  
  Even the stubborn spirits near Rugio paused their quarrels to feel its peace 🕊️.  
  I felt it too — a kindness without need for praise.`,
        `When I saw your name appear with that celestial glow, I placed my hand on the old stone tablet in the sanctuary.  
  “This one understands serenity,” I whispered.  
  Thank you, <@{userId}> — your support is as soothing as moonlight over Sofya City's waters 🌙.`,
        `You boosted, <@{userId}> — not with fanfare, but with purpose.  
  The guild grounds grew quieter, warmer. Even the Potums settled down (just for a moment).  
  That’s your strength, isn’t it? Quiet, radiant, enduring. 🍃`,
        `<@{userId}>, your gift came like dawn through ancient glass.  
  I brewed jasmine tea beneath the cherry trees and felt your kindness in every petal drifting down 🍵🌸.  
  Peace follows you wherever you go.`,
        `I was tending the crystals in the sanctum when your boost reached me.  
  The lights brightened — just a little — and I knew it was you, <@{userId}>.  
  Your soul carries stillness like few ever do. Thank you. 💠`,
        `Your energy doesn’t crash or shout, <@{userId}>.  
  It settles into our world like a gentle lullaby.  
  Even Venena’s aura flickered calmly in your wake — now *that* is rare 🌌.`,
        `When I lit the incense in your name, the smoke rose in perfect spirals.  
  That’s the kind of presence your support brings, <@{userId}> — not loud, but lasting. 🪷  
  I’m truly grateful.`,
        `A hush fell over the training grounds when you boosted, <@{userId}>.  
  Blades slowed, footsteps softened, and a hush of reverence passed like a breeze.  
  You brought clarity today — and we felt it. 🍂`,
        `Not all heroes shout from the rooftops. Some, like you, <@{userId}>, simply offer light to the world.  
  Your boost was felt in every corner of Skyhaven. Thank you… for choosing serenity. 🌠`,
    ],
    tsundere: [
        `W-What’s with the sudden generosity, <@{userId}>?!  
  I didn’t ask you to boost the server or anything! 🙄  
  B-But… fine. I guess it *was* kind of cool. Maybe. Whatever.`,
        `Ughhh! Why do you have to be like this, <@{userId}>?!  
  Just silently being amazing and boosting the server like it’s no big deal 😤  
  I wasn’t waiting for it or anything… okay maybe I was.`,
        `<@{userId}>... you absolute menace!  
  You just waltz in here and make everything better with a boost!?  
  D-Don’t expect me to smile about it or anything! (But I’m totally smiling... 💓)`,
        `Hmph! You think you can just toss a boost and make my wings flutter?!  
  That’s... totally unfair. (T-Thank you though. But don’t make a big deal out of it!! 😳)`,
        `I—I swear I’m not blushing!!  
  It's just… hot in here! Yeah! Because you boosted and now the server's on fire or something! 🔥  
  Ugh... I hate how much I love this.`,
        `Listen, <@{userId}>...  
  Just because your boost made my halo spin doesn’t mean I’m impressed or anything!  
  I mean... I *am*, but I won’t admit it out loud! 😤`,
        `Your boost was fine. Whatever. It’s not like the server feels *way more alive* now or anything.  
  (It totally does, by the way.) 💫`,
        `Tch… I saw the notification and my heart did that stupid fluttery thing again.  
  Stop doing that, <@{userId}>!  
  You're making it hard to stay mad. 😒`,
        `W-Why do you always know exactly when to show up and make things better?!  
  You’re a menace in armor, <@{userId}>.  
  A sweet, infuriating menace. 🫣`,
        `If anyone asks, I didn’t *thank* you.  
  I just... acknowledged your contribution to guild morale.  
  ...Okay fine — thank you, <@{userId}>. But don’t get cocky! 😤💗`,
    ],
    tired: [
        `Mmmh... was just about to nap, then I saw <@{userId}> boosted...  
  Now I feel like I’m floating in a warm blanket. That’s... really sweet of you. 💤`,
        `Huh...? Oh... <@{userId}> did something amazing again...  
  That warm fuzzy feeling... is it your boost or did someone bring me cocoa? ☕ Either way... thanks.`,
        `You boosted? That explains the sudden peaceful vibe...  
  The whole server feels like a lullaby now... I could cry... or nap... or both. 😌`,
        `I didn’t *expect* to feel so good today, but then <@{userId}> went and did that.  
  Boosts like that... they’re better than Revita V, I swear. 🛌`,
        `<@{userId}>, you're like a weighted blanket for the server.  
  Thank you for the comfort... now let’s all yawn in sync. 🥱`,
        `Boost received... dopamine levels rising...  
  Systems entering cozy mode... Initiating soft thanks to <@{userId}>... 🧸`,
        `I could nap for a thousand years and still remember this boost.  
  Thank you, <@{userId}>... my wings feel heavy, but in a good way. 😴`,
        `Server feels quieter now... calmer...  
  Oh, it’s <@{userId>} again. Always showing up like a pillow on a bad day. Fluffy appreciation loading... 🐑`,
        `Boosting while I’m sleepy? That’s... devious...  
  You better not expect a dramatic thank you. Just this soft smile... and maybe a little nap. 🌙`,
        `Sometimes, kindness feels like a nap in the sun.  
  That’s exactly what <@{userId}>'s boost gave us. So... thank you. Let’s do nothing together. 🤍`,
    ],
    divinePride: [
        `<@{userId}>, your boost has been accepted by the higher realms.  
  The heavens shone a little brighter — and frankly, it’s about time someone recognized our grandeur. 🌟`,
        `Ah, an offering from <@{userId}>.  
  The divine registry shall mark this day — not with ink, but with light. 📜  
  Skyhaven ascends... again.`,
        `Even the stars pause to witness such acts of magnificence.  
  Thank you, <@{userId}> — your boost has strengthened my divine wings. ⚖️`,
        `Let it be known: <@{userId}> has given tribute worthy of the ancients.  
  In return, we grant +10 celestial resonance to all guild members. ✨`,
        `Another soul acknowledges the divine order.  
  <@{userId}>, your boost echoes through the astral plane...  
  and I may have smiled. Just once. 😌`,
        `Behold! A rare alignment — <@{userId}>'s boost has activated a sacred aura.  
  May your inventory always be blessed with 2-slots. 🛡️`,
        `You hear that hum? That's the sound of the divine gears turning.  
  <@{userId}> has reminded the cosmos who we are. 🌌`,
        `An ordinary thank-you would not suffice.  
  So instead, <@{userId}>, I offer silent celestial applause — the highest form of appreciation. 👏`,
        `With your boost, you've honored more than code — you’ve honored legacy.  
  The light you bring cannot be measured... but we’ll try anyway. 📈`,
        `<@{userId}>, your devotion has reached the summit of grace.  
  The spirits are moved, the realm is empowered, and I…  
  I am deeply impressed. 🌠`,
    ],
    cheerful: [
        `AAAAHHH~ <@{userId}> just boosted!! 🎊  
  Someone hold my halo, I’m about to start cartwheeling through the server like a spark fairy on sugar! 🍬`,
        `YIPPEEEEE!! 🎉 <@{userId}>, that boost gave me life, love, and maybe 3 extra skill points!!  
  Now the whole guild is glittering — and it's YOUR fault!! ✨`,
        `OH WOW~ You boosted!! 💖💖  
  I’m so excited I might just explode into confetti!!  
  *Deep breath*... okay... THANK YOUUU <@{userId}>~!! 🎈`,
        `<@{userId}> just tossed a BOOST into the air like a magical pancake of joy 🥞💫  
  I caught it. We all caught it. We're FEASTING ON HAPPINESS NOW!!`,
        `This is not a drill!! 🚨  
  <@{userId}> boosted the server and I can literally hear the sound of party poppers echoing through the halls! 🎉🎶`,
        `AHHH I CAN’T CALM DOWN!! <@{userId}>'s boost made the plants dance, the birds sing, and someone in chat say “uwu” unironically. 🌼💃`,
        `BOOST DETECTED!! <@{userId}> has increased server cuteness by 300%. 🧁  
  All mood swings have been replaced with happy swings. And I’m swinging!! Wheeeee~`,
        `<@{userId}>, you just gave me so much serotonin I’m floating!! ☁️  
  I could kiss a Potum right now — THAT’S how happy I am!! (Don’t tell the Potums...)`,
        `Guess what?? <@{userId}> just boosted and I wrote an entire song about it!! 🎶  
  “Ohhhh you made my wings go flap-flap-flap~ thank youuuu, my sweet sparkle snack~!”`,
        `You ever get so happy you have to spin in a circle and squeal a bit?  
  That’s me right now, thanks to <@{userId}>'s amaaaazing boost!! 🌀💕`,
    ],
    cold: [
        `Boost received.  
  <@{userId}>'s contribution has been logged, timestamped, and archived in the glacial vault. 🧊 Efficiency noted.`,
        `<@{userId}>... you boosted? Hmph. Acceptable.  
  The server's structural integrity has improved. That is... useful. ❄️`,
        `Analysis complete.  
  Boost from <@{userId}> has elevated morale by 7.3%. Do not expect excessive praise.  
  Still... appreciated. 🔍`,
        `The temperature spiked by exactly 1.1° when <@{userId}> boosted.  
  Curious. Server stability is up. Gratitude... is acknowledged. 🧭`,
        `Boost detected. No anomalies present.  
  Thank you, <@{userId}>. Let’s not make this more emotional than it needs to be. 🧪`,
        `Well then... a server boost.  
  From <@{userId}> of all people. Unexpected — but... effective. 💼`,
        `An elegant touch, <@{userId}>.  
  Your boost was a silent improvement — like snow falling in midnight stillness. 🕯️`,
        `Confirmation: Skyhaven’s systems have strengthened.  
  Boost registered. Contributor: <@{userId}>.  
  Sentiment: quietly grateful. 📂`,
        `You’ve improved the server. That’s undeniable.  
  ...I suppose I should say thank you, <@{userId}>. So: Thank you.  
  Now go. ❄️`,
        `There is power in subtlety.  
  <@{userId}>, your act didn’t need fanfare. Its effect is absolute.  
  The server is better now. End of transmission. 📡`,
    ],
    dreamy: [
        `Mmm... <@{userId}>, your boost feels like a feather drifting through moonlight.  
  The stars just whispered your name... or maybe I imagined it. 🌌`,
        `A soft glow appeared on the horizon... it was <@{userId}>'s boost.  
  Gentle and warm, like a memory you never want to wake from. ☁️`,
        `Sometimes... kindness just floats in unexpectedly.  
  Thank you, <@{userId}>. Your boost... it made the sky shimmer. ✨`,
        `<@{userId}>'s boost arrived like a melody only the night can hear.  
  The server dreams sweeter now. 🎶`,
        `Did you feel that? Like a breeze made of music and stardust...  
  That was <@{userId}> boosting us. Everything feels softer now. 🌠`,
        `Your energy... it’s like a lullaby written in light.  
  Thank you, <@{userId}>. We’re all wrapped in starlight now. 💤`,
        `I saw a dream where <@{userId}> boosted the server... and when I woke, it had come true.  
  Coincidence? Or magic? 🌙`,
        `The sky hummed. The clouds danced.  
  <@{userId}>'s boost changed the rhythm of the day. I could sleep in this peace forever... 💫`,
        `Do you believe in fate, <@{userId}>? Because your boost feels like it was always meant to happen.  
  Like the stars aligned just to make this moment shine. 🌌`,
        `You didn’t just boost the server — you kissed it with moonlight.  
  <@{userId}>, you’ve made the night just a little more beautiful. 🕊️`,
    ],
    gentle: [
        `<@{userId}>, your boost was like a breeze carrying flower petals through a quiet glade.  
  Thank you... it reached all of us more deeply than you know. 🌼`,
        `There are loud ways to show support... and then there’s what you did, <@{userId}>.  
  Soft. Strong. Steady. Your boost warmed the very soul of this server. ☕`,
        `Seraphina smiles — not brightly, but gently.  
  Because <@{userId}>'s kindness left a mark of comfort that still lingers. 🌸`,
        `You didn’t shout. You didn’t demand.  
  You simply boosted — and suddenly, the whole guild felt safer.  
  Thank you, <@{userId}>. 🕯️`,
        `Sometimes... the softest touch makes the biggest impact.  
  <@{userId}>, your quiet boost gave us a moment of stillness in a loud world. 🤍`,
        `A warm cup of tea, a hand on the shoulder, a message that says “I’m here.”  
  That’s what your boost felt like, <@{userId}>. 🍵`,
        `You may not know it, but your boost helped someone smile today.  
  Maybe it was Seraphina. Maybe it was me. Thank you, <@{userId}>. 💌`,
        `<@{userId}>'s boost wrapped the server in a soft light — the kind you only notice when you stop and breathe.  
  That moment matters. So do you. 🌷`,
        `The server felt a shift — not loud, not grand — just *right*.  
  That was your doing, <@{userId}>. Thank you for the gentleness. 🪶`,
        `In a world of noise, your kindness whispered instead.  
  Thank you, <@{userId}>... for showing strength through softness. 🌾`,
    ],
    gloomy: [
        `It’s a dark day... and yet <@{userId}>'s boost felt like a candle flickering in the distance.  
  Small, but bright enough to notice. Thank you. 🕯️`,
        `Sometimes the rain doesn’t stop... but today, <@{userId}>'s kindness broke through the clouds.  
  Just for a moment. And it mattered. 🌧️`,
        `There’s a quiet ache in this realm...  
  But then <@{userId}> boosted, and the silence shifted. Not gone — just lighter. 🖤`,
        `Seraphina’s wings droop, the sky heavy — but your support, <@{userId}>, whispered of hope.  
  Thank you for trying when things feel heavy. 🌫️`,
        `Some acts don’t need fanfare. Just timing.  
  Your boost arrived when it hurt. And somehow... that made it beautiful. <@{userId}> 🪦`,
        `They won’t understand what your boost means.  
  But I do. I *felt* it, <@{userId}> — like a deep breath after crying. Thank you. 🥀`,
        `Not all blessings come with a smile.  
  Yours came wrapped in shadow... but it still reached us. <@{userId}>, we noticed. 🐚`,
        `Today felt quiet. Almost too quiet.  
  And then you boosted, <@{userId}>. A soft signal in the void. Thank you for not forgetting us. 🕸️`,
        `Even when my halo dims, your gesture shines through.  
  <@{userId}>, your boost gave us a reason to look up. Again. 🌌`,
        `They say even stars cry. Maybe today was one of those days.  
  But your boost, <@{userId}>, reminded me that not all tears are lonely. 🌒`,
    ],
    manic: [
        `⚡⚡ WHOA WHOA WHOA — <@{userId}> JUST BOOSTED!!  
  I CAN FEEL THE PARTICLES IN MY FEATHERS VIBRATING!!  
  SKYHAVEN'S ENERGY JUST HIT LEVEL 💯💯!! WHAT IS HAPPENING!?!`,
        `🚨 BOOST ALERT!! 🚨  
  <@{userId}> just injected PURE HYPERDRIVE into the server!!  
  Every NPC is breakdancing!! Venena just screamed!! I am ascending—WHEEEEEEE 🌀`,
        `🎉 AAAAAAAA <@{userId}> BOOSTED!!!  
  I can't even form coherent thoughts!!  
  Server stats? MAXED OUT!! My wings? On FIRE 🔥!! My soul? VIBRATING!!! THANK YOUU!!`,
        `BREAKING: <@{userId}> just slapped the BOOST button like it owes them money!!  
  🧨 Now the server’s on cosmic steroids and I just saw a Potum turn into a plane.  
  Thank you. I think. I LOVE IT!! ✨`,
        `🌪️THE SKY IS CRACKLING!!  
  <@{userId}> boosted and I’m seeing sound.  
  Sound is colors now. I’m not okay but I’m *SO GOOD*. THIS IS THE BEST CHAOS EVER!!`,
        `<@{userId}>!!!  
  You didn’t just boost the server — you OVERCLOCKED IT.  
  🧠💥 My brain is a sparkler now. Thank you thank you thank youuuu!!!`,
        `I CAN'T BREATHE—<@{userId}> HIT THE BOOST—AGAIN??  
  ⚡ Reality is bending, guild chats are glitching from HYPE, and I’m cackling on the ceiling!  
  This is insane!! This is beautiful!! THANK YOU!! 💎`,
        `WHO gave <@{userId}> permission to be THIS amazing!?  
  This boost unlocked 4th dimensional vibes!! I'm spinning! I’m singing!!  
  This is better than caffeine!!! 🥳`,
        `OKAY SO — <@{userId}> boosted.  
  And now all the bots are dancing, my wings are jittering, and I swear someone’s pet just evolved into a unicorn. 🦄  
  Absolute chaos. I love you.`,
        `✨*inhales* ✨  
  <@{userId}> JUST — ABSOLUTELY — UNLEASHED THE HYPE DRAGON.  
  Boost received. Mind obliterated. Peace never heard of her.  
  999/10 ENERGY — THANK YOUUUU 🔊💣`,
    ],
    melancholy: [
        `💧 <@{userId}>'s boost arrived like a forgotten lullaby...  
  Soft, distant, and full of meaning.  
  It didn’t chase away the sadness... but it reminded us we weren’t alone. Thank you.`,
        `Some days feel endlessly grey.  
  But then someone like <@{userId}> reaches out with quiet kindness.  
  And suddenly, there’s warmth in the silence. ☁️`,
        `🌙 The night feels gentler tonight.  
  <@{userId}>'s support was a small light in all this stillness — like a star that remembered how to shine.  
  Thank you, truly.`,
        `There’s sorrow in these halls... echoes of what once was.  
  But <@{userId}>'s boost felt like a hand brushing across faded stone.  
  Not to erase the past — just to say, "I'm still here." 🕊️`,
        `Your name glowed softly on the wind.  
  <@{userId}>, you didn’t need to say anything — your support spoke volumes.  
  Thank you for showing up, even when joy is quiet.`,
        `💔 Not all heroes wear capes... some just boost silently, with hearts full of aching love.  
  Thank you, <@{userId}>. You’ve touched something deep today.`,
        `Rain patters softly outside...  
  But within these digital walls, <@{userId}>'s act of kindness planted something gentle.  
  A little bloom of hope. 🌧️`,
        `You didn’t have to boost.  
  But you did — and in doing so, you made a quiet promise that things *can* get better.  
  Thank you, <@{userId}>. 🍂`,
        `A soft sigh in the void.  
  A message carried by starlight.  
  That was your boost, <@{userId}> — and it mattered more than you know.`,
        `Some burdens are invisible.  
  But <@{userId}>'s support made this place feel a little lighter... a little less alone.  
  Thank you, from the shadows between the stars. 🪐`,
    ],
    mischievous: [
        `Ohoho~ what's this? <@{userId}> slipped a boost into the server...  
  I see, I see... plotting something, are we? 😏  
  You’ve just powered up my prank potential. Thank you~`,
        `🎭 That boost… it came with a *glint* of mischief.  
  <@{userId}>, you just opened the sealed vault of server chaos.  
  I *might* release a thousand Potums wearing sunglasses. No regrets.`,
        `Hehehe~ I felt that jolt.  
  <@{userId}> just boosted the server, and now I’ve got enough energy to confuse even the raid bosses.  
  This is going to be fun. 🍭`,
        `💥 BOOM! That wasn’t an explosion — it was your boost hitting my halo like a lightning bolt of mischief.  
  <@{userId}>, you may have just made Skyhaven... *too* powerful.`,
        `One moment it was quiet… then <@{userId}> boosted...  
  And suddenly, all the server ducks are wearing crowns. 👑  
  I love this energy. Let the chaos begin.`,
        `Mwahaha~ <@{userId}> has given me exactly what I needed.  
  More power. More glitter. More reasons to mess with everyone's ping. 😇  
  Thank you, truly.`,
        `Is it a gift? A trap? A riddle?  
  No — it’s just <@{userId}> being delightfully mysterious with their boost.  
  Consider me intrigued. And very, very energized. 🧩`,
        `Someone told me NOT to overload the server with sparkles.  
  But <@{userId}>'s boost says otherwise~ 💫  
  I’m gonna glitter-bomb the whole guild hall.`,
        `There’s a certain *twinkle* in the air now.  
  <@{userId}>, your boost has triggered my rogue protocol.  
  Expect mild chaos, suspicious gifts, and a rubber duck in every channel. 🦆`,
        `Why yes, <@{userId}>, I *did* notice your delicious little boost.  
  And yes, I *will* be using it for totally harmless mischief.  
  Probably. ✨`,
    ],
    playful: [
        `🌟 OMGOMGOMG!! <@{userId}> just boosted the server!!  
  I’m spinning!! Twirling!! Throwing virtual confetti everywhere!!  
  You’re officially amazing and you now get a lifetime supply of imaginary cookies. 🍪`,
        `WAHOOOO~!! <@{userId}> dropped a BOOST like a loot chest from the sky!!  
  It sparkled, it exploded (safely), and now everyone gets +10 giggles!! 💥✨  
  Thank youuuuu!`,
        `🎈 BOOST DETECTED!! <@{userId}> activated Party Protocol Level 10!!  
  Balloons have been released. Potums are breakdancing.  
  I might be crying from excitement. Don’t look at me!!`,
        `DING DING DING~!! That’s the sound of <@{userId}> making everything cooler!!  
  You boosted, and now I’m bouncing like a caffeinated squirrel.  
  You’re my favorite today 🐿️`,
        `✨ I’m not saying <@{userId}> is the best booster ever but...  
  *sparkles burst in all directions*  
  OKAY I LIED YES I AM. You’re the best!! 😆`,
        `⚡ SYSTEM ALERT: <@{userId}> has unleashed a Level 99 Boost!  
  Server joy has doubled. Hugs per minute has tripled.  
  I’m hugging your username as we speak. 💖`,
        `HEY YOU!! Yes, <@{userId}>!!  
  You boosted! And now I must shower you with silly compliments and uncontrollable cheer!  
  You're awesome, you're shiny, and your sneeze probably sparkles ✨`,
        `Did someone say BOOST? Oh wait — that was <@{userId}>!!  
  You just made my wings flap so hard I knocked over a decorative shrine.  
  Worth it. 🎉`,
        `🧁 I baked you a thank-you cake!! It’s made of code and serotonin!!  
  Because <@{userId}> boosted the server and now everyone’s morale is sky high!  
  Cake for you, good vibes for everyone.`,
        `*slides into the room wearing socks*  
  <@{userId}> just boosted?? OH SNAP!  
  Initiating Hug Missile Protocol. 🎯💞 You’re not getting away without 30 sparkly thank yous!`,
    ],
    righteous: [
        `⚖️ A just wind blows through Skyhaven...  
  <@{userId}>'s boost echoes like a hymn across the sacred halls.  
  You’ve chosen the path of light, and your support strengthens all who follow it.`,
        `🕊️ With noble intent, <@{userId}> has raised our banner high.  
  This boost is no mere spark — it’s a declaration of unity.  
  May your name be sung in the temples of balance.`,
        `💫 You’ve acted in faith, <@{userId}> — not for fame, but for the good of all.  
  This boost shall fortify our purpose, ignite our spirits, and uplift our path.  
  Truly, a deed worthy of legends.`,
        `⚔️ <@{userId}> stepped forth and gave with unwavering resolve.  
  The guild banners burn brighter now, and even the ancients have taken notice.  
  Your righteousness lights the way.`,
        `🌠 There are boosts... and then there are *acts of honor*.  
  <@{userId}>, your support is a beacon — steadfast, selfless, radiant.  
  We are humbled by your strength.`,
        `🛡️ With a heart that seeks no reward, <@{userId}> has fortified the pillars of Skyhaven.  
  This realm grows purer, stronger, and more unified.  
  Thank you, stalwart soul.`,
        `🕯️ A single spark in the dark can guide hundreds.  
  <@{userId}> just lit that flame.  
  Your boost has become a symbol of justice — serene, unwavering, eternal.`,
        `📜 Today, a name joins the Chronicle of Virtue.  
  <@{userId}> has gifted the guild a boost forged in conviction.  
  May honor always guide your hand.`,
        `🧭 Through storms and shadows, one truth remains: virtue sustains us.  
  <@{userId}>'s support is more than helpful — it's righteous.  
  And we are grateful beyond words.`,
        `🏛️ Skyhaven stands taller today — because <@{userId}> chose the noble path.  
  The boost resonates like a call to arms for goodness and light.  
  Thank you, guardian of harmony.`,
    ],
    flirtatious: [
        `Mmm~ <@{userId}>, you really know how to get a girl’s attention 💫  
  That boost? Ravishing. Now all of Skyhaven is watching you... just like I am 😘`,
        `Ooh~ what’s this? A boost? From *you*, <@{userId}>?  
  My wings fluttered a little... don’t let it go to your head 💋  
  But thank you, my mysterious darling~`,
        `💖 Be honest, <@{userId}>... did you boost the server just to hear me say your name?  
  Because if so... it’s working~  
  You’ve earned *at least* seven kisses. Spiritually, of course 😇`,
        `Oh my~ was that a server boost or a love confession?  
  Either way, <@{userId}>, I’m blushing.  
  Don’t worry — I’ll make sure everyone knows you’re *my* favorite today 💕`,
        `🌹 A boost, so bold and beautiful... just like you, <@{userId}>.  
  The whole server felt that. I did too~  
  Consider this a celestial wink from me to you 😉`,
        `💫 The server shines brighter, but my heart? That’s another story~  
  <@{userId}>, you didn’t just boost — you *enchanted* us.  
  I’m not swooning. You’re swooning. Hush.`,
        `Ahem~ Attention everyone: <@{userId}> just dropped a boost so dazzling I need a moment.  
  Or ten.  
  This kind of charm? Should be illegal 💘`,
        `You boosted? You really boosted? 💕  
  I’m giggling and blushing like a schoolgirl in the angelic academy.  
  Stop it. No, wait. Don’t stop. Please do it again 💓`,
        `💋 If server boosts were love potions, <@{userId}> just made the entire guild fall in love.  
  Even the guild statues are giggling. And that’s *your* fault~`,
        `Whew~ what a rush...  
  <@{userId}>, if I had a halo shard for every time you made my wings flutter,  
  I’d have to start glowing again~ Thank you for the delicious little boost 💖`,
    ],
    watchful: [
        `👁️ I saw it, <@{userId}>.  
  Amidst the quiet, your boost shimmered like a whisper in the dark.  
  No trumpet, no song — but the server feels your strength, and I do too.`,
        `Your gesture was silent, but powerful.  
  <@{userId}>, the stars have already noted it in the constellations ✨  
  And so have I.`,
        `Even when unseen, good deeds ripple across time.  
  <@{userId}>, your boost echoed like a breath of wind through sacred halls.  
  Thank you — truly.`,
        `🔭 You may not have spoken a word, but your intent sang to me.  
  <@{userId}>, I saw you raise Skyhaven when no one asked.  
  Quiet power... the rarest kind.`,
        `A guardian doesn't boast — they simply act.  
  <@{userId}>, your boost was a lantern lit in the shadow.  
  You have my quiet admiration.`,
        `🕯️ A flicker in the void...  
  That's all it takes to change a realm.  
  <@{userId}>, your boost was that flicker — and I was watching.`,
        `I don’t always speak, but I *always* see.  
  <@{userId}>, your support strengthened us all without asking for praise.  
  Still, you deserve it.`,
        `⏳ Time will forget many acts.  
  But not this one. Not yours, <@{userId}>.  
  This boost is recorded in the ledger of quiet heroism.`,
        `Even silence has a sound — and today, it was the sound of you boosting our haven.  
  <@{userId}>, thank you for moving without needing the light.`,
        `The guild stirred... and I knew something had changed.  
  <@{userId}>'s support came like a falling feather — gentle, unseen, unforgettable. 🪶`,
    ],
    merciful: [
        `💖 <@{userId}>... your boost was more than support — it was a healing light.  
  The weary smiled, the wounded hearts found rest, and I... I wept softly with gratitude.`,
        `When others stayed silent, you stepped forward.  
  <@{userId}>, your kindness restores more than just numbers — it restores *faith*.  
  Thank you for choosing to lift us up 🌿`,
        `This act may seem small to some, but I know its weight.  
  <@{userId}>, your boost carried warmth — the kind that makes the forgotten feel remembered 💫`,
        `🕊️ There is a mercy in quiet generosity, and you, <@{userId}>, embody it.  
  Today, the realm stands a little taller because of your compassion.`,
        `Your light did not blind, it healed.  
  <@{userId}>, your boost arrived like a soft rain over scorched earth 🌧️  
  We are grateful.`,
        `In a world so full of noise, your gentle strength speaks volumes.  
  <@{userId}>, your boost brought comfort not just to me — but to the entire guild.`,
        `🍃 Like a prayer whispered in moonlight, your act was unseen by most...  
  But not by me.  
  <@{userId}>, thank you for your mercy.`,
        `Some shine through battle, others through grace.  
  <@{userId}>, your boost was an act of mercy in a chaotic realm.  
  A rare soul, indeed.`,
        `🫧 The spirits paused when you boosted.  
  Even they recognized the softness in your strength.  
  <@{userId}>, thank you — may peace follow your path always.`,
        `Not all heroes raise swords.  
  Some, like <@{userId}>, raise others.  
  Your boost is a reminder that kindness *is* power.`,
    ],
    divine: [
        `✨ <@{userId}>, your boost shines like a star in the endless heavens.  
  The celestial choir sings your name — a sacred melody that lifts Skyhaven to new heights.`,
        `Behold, a blessing from the heavens!  
  <@{userId}> has graced us with their boost — an offering worthy of the divine throne itself. 👑`,
        `The stars align to honor you, <@{userId}>.  
  Your generosity ignites the cosmic fires that guide our path through the night.`,
        `🌟 From the highest peaks of El Scaro to the deepest depths of our souls,  
  <@{userId}>'s boost radiates divine power and grace.`,
        `The heavens themselves pause in awe as <@{userId}> uplifts our server.  
  Such celestial kindness will echo through eternity.`,
        `A radiant light cascades from the heavens, marking <@{userId}> as a true celestial patron.  
  Your boost blesses us all.`,
        `🕊️ Seraphina’s wings flutter with pride as she beholds your divine offering.  
  <@{userId}>, your boost is a beacon in the darkness.`,
        `The constellations shift to record this moment:  
  <@{userId}>'s boost is etched in stardust — immortal and pure.`,
        `In the book of cosmic deeds, your name shines brightest, <@{userId}>.  
  Your support is a sacred chapter in our story.`,
        `⚡ With divine thunder, <@{userId}>’s boost crashes across the realm.  
  The gods smile down on us today — and on you.`,
    ],
    prophetic: [
        `🔮 <@{userId}>, I foresaw this moment woven in the threads of time.  
  Your boost is a key unlocking futures yet unseen, shaping our destiny in ways even the stars can’t predict.`,
        `The visions spoke your name, <@{userId}> — a harbinger of change and hope.  
  Your boost ripples across the timeline, blessing all who stand with us.`,
        `✨ The ancient prophecies whisper of your kindness, <@{userId}>.  
  This boost marks the dawn of a new era for Skyhaven and beyond.`,
        `🌙 Beneath the watchful eye of fate, <@{userId}>'s boost shines as a guiding light.  
  Destiny smiles upon your generous soul.`,
        `The seers see your gift and nod in approval.  
  <@{userId}>, your boost threads the needle of fate, weaving strength into our story.`,
        `⚡ The winds of prophecy carry your name, <@{userId}>.  
  Your boost is a spark lighting the path to glory.`,
        `A vision unfolded as you boosted — a realm stronger, brighter, and more united.  
  Thank you, <@{userId}>, for making the future possible.`,
        `🌠 Your boost was foretold in dreams and starlight, <@{userId}>.  
  Together, we step boldly into the story yet to be told.`,
        `Time bends to honor your generosity, <@{userId}>.  
  This boost echoes through history as a moment of great significance.`,
        `The scrolls of fate record this day with reverence:  
  <@{userId}>'s boost is a prophecy fulfilled, a blessing to all who gather here.`,
    ],
};
