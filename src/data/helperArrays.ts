import path from "path";
import { ColorResolvable } from "discord.js";

type LevelRole = {
  name: string;
  minLevel: number;
  maxLevel: number;
  color: ColorResolvable;
};

export const levelRoles: LevelRole[] = [
  {
    name: "Certified Lurker",
    minLevel: 1,
    maxLevel: 5,
    color: "#808080", // Gray
  },
  {
    name: "Yapmaster Apprentice",
    minLevel: 6,
    maxLevel: 10,
    color: "#1E90FF", // Dodger Blue
  },
  {
    name: "Message Goblin",
    minLevel: 11,
    maxLevel: 20,
    color: "#32CD32", // Lime Green
  },
  {
    name: "Keyboard Crusader",
    minLevel: 21,
    maxLevel: 30,
    color: "#FFA500", // Orange
  },
  {
    name: "Legendary Typist",
    minLevel: 31,
    maxLevel: 50,
    color: "#8A2BE2", // Blue Violet
  },
  {
    name: "The Yapfather",
    minLevel: 51,
    maxLevel: 70,
    color: "#FF69B4", // Hot Pink
  },
  {
    name: "Chat Ascendant",
    minLevel: 71,
    maxLevel: Infinity,
    color: "#FFD700", // Gold
  },
];

export const giveawayRoles = [
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

export const discordBadges: Map<string, string> = new Map([
  [
    "Staff",
    path.resolve(__dirname, "../assets/discord_badges/images/staff.png"),
  ],
  [
    "Partner",
    path.resolve(__dirname, "../assets/discord_badges/images/partner.png"),
  ],
  [
    "HypeSquadOnlineHouse1",
    path.resolve(__dirname, "../assets/discord_badges/images/bravery.png"),
  ],
  [
    "HypeSquadOnlineHouse2",
    path.resolve(__dirname, "../assets/discord_badges/images/brilliance.png"),
  ],
  [
    "HypeSquadOnlineHouse3",
    path.resolve(__dirname, "../assets/discord_badges/images/balance.png"),
  ],
  [
    "BugHunterLevel1",
    path.resolve(__dirname, "../assets/discord_badges/images/bughunter_1.png"),
  ],
  [
    "BugHunterLevel2",
    path.resolve(__dirname, "../assets/discord_badges/images/bughunter_2.png"),
  ],
  [
    "EarlySupporter",
    path.resolve(
      __dirname,
      "../assets/discord_badges/images/early_supporter.png"
    ),
  ],
  [
    "VerifiedDeveloper",
    path.resolve(__dirname, "../assets/discord_badges/images/developer.png"),
  ],
  [
    "CertifiedModerator",
    path.resolve(
      __dirname,
      "../assets/discord_badges/images/certified_moderator.png"
    ),
  ],
  [
    "ActiveDeveloper",
    path.resolve(
      __dirname,
      "../assets/discord_badges/images/active_developer.png"
    ),
  ],
  [
    "HypeSquad",
    path.resolve(
      __dirname,
      "../assets/discord_badges/images/hypesquad_events.png"
    ),
  ],
  [
    "PremiumEarlySupporter",
    path.resolve(
      __dirname,
      "../assets/discord_badges/images/early_supporter.png"
    ),
  ],
  [
    "ServerBooster",
    path.resolve(__dirname, "../assets/discord_badges/images/boosting_1.png"),
  ],
  [
    "Nitro",
    path.resolve(__dirname, "../assets/discord_badges/images/nitro.png"),
  ],
]);

export const xpBarColors: string[] = [
  "#00ffff", // Cyan / Aqua
  "#32cd32", // Lime Green
  "#ffd700", // Gold
  "#1e90ff", // Dodger Blue
  "#ff1493", // Deep Pink
  "#ffa500", // Orange
];

export const rolePromotionMessages: string[] = [
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

export const roleDemotionMessages: string[] = [
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

export const darkBackgroundColors = [
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

export const lightBackgroundColors = [
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

export const rolePromotionGifs: string[][] = [
  [
    "https://media.tenor.com/kJS0W9pqUDQAAAAM/lurking-creeping.gif",
    "https://media.tenor.com/TbKly4oJOBgAAAAM/anthony-anderson-looking.gif",
    "https://i.gifer.com/GRDF.gif",
    "https://media2.giphy.com/media/OCOYbqiXzkxMI/200w.gif?cid=6c09b952jk1a0azl53x64ns8fy6jeoht7j93jwdom4xglwq9&ep=v1_gifs_search&rid=200w.gif&ct=g",
  ],
  [
    "https://media.tenor.com/MDxs9sUkJ_AAAAAM/wizard-dance.gif",
    "https://media.tenor.com/iCFNj4B9zQUAAAAM/dwight.gif",
    "https://media.tenor.com/xXNYv9q9HZEAAAAM/stan-twitter-leobylaw.gif",
    "https://www.hubspot.com/hs-fs/hubfs/receiving%20redundant%20phone%20calls.gif?width=480&height=269&name=receiving%20redundant%20phone%20calls.gif",
  ],
  [
    "https://i.pinimg.com/originals/88/10/64/881064cfb0167713e5b726335f7ae23f.gif",
    "https://64.media.tumblr.com/af30c5f46a6554063a71f9d105cc588b/tumblr_p9j0mn85mu1rrkahjo1_540.gifv",
    "https://64.media.tumblr.com/35ebcb06d0f8779378f613abf9bc1558/b329276fd89b8684-cf/s500x750/c1dadb37f033e59e7d5d4d6e9850ff529c6d15a6.gif",
  ],
  [
    "https://media.tenor.com/iCqG_iT-h48AAAAM/bills-ugh.gif",
    "https://media.tenor.com/1MSxCprd3MgAAAAM/working.gif",
    "https://media.giphy.com/media/XIqCQx02E1U9W/giphy.gif",
    "https://i.pinimg.com/originals/4a/e5/d5/4ae5d5d0b85a157c6dac7f6a17bb3078.gif",
    "https://i.makeagif.com/media/5-26-2015/DkgsXO.gif",
    "https://media.tenor.com/dPLWf7LikXoAAAAM/typing-gif.gif",
  ],
  [
    "https://cdn.mos.cms.futurecdn.net/Z7Rv4K4aVfzDzJnHPJXPF8.gif",
    "https://codaio.imgix.net/docs/4IMyNAs4pF/blobs/bl-8D8x1g0Vjh/740de5d14aba235bc82ca6fb7636782cd8cf625e59b394351437d720e4925cd27ac5b519cad104c29e813f1a7aa7324f130add2c31496a30ec63ea7fe0fec6a6cce82787b8aaf3d4ca59488d11bf2fc129feb59c6c0dd7a73cf381a78a14963673d44d6c?fit=crop&ar=1.91%3A1&fm=jpg",
    "https://media.tenor.com/CbWKthhbhEoAAAAM/insane-fast-typing-cat.gif",
  ],
  [
    "https://media.tenor.com/rCsC_pOIquQAAAAM/cage-priest.gif",
    "https://media.tenor.com/j_X4pXUKVJkAAAAM/face-off-faceoff.gif",
    "https://i.gifer.com/ERqp.gif",
  ],
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

export const leaderboardThumbnail = path.resolve(
  __dirname,
  "../assets/logos/rainbow_logo.png"
);

export const farewellMessages: string[] = [
  "{user} has vanished into the depths of Sofya City. Safe travels, adventurer!",
  "{user} has left the guild hall. May the Mana guide you.",
  "{user}'s orb disappeared in a flash of light. Farewell!",
  "{user} unequipped their guild badge and logged out. Until next time!",
  "{user} has left to forge a new destiny. The world of Toram awaits.",
  "A portal opened... and {user} stepped through. Safe journeys, brave soul.",
  "{user} has returned to the land of the NPCs. Goodbye, traveler.",
  "{user}'s name fades from the guild roster. We’ll remember your contributions.",
  "A mysterious adventurer named {user} has left the party...",
  "{user} put down their weapon and walked into the sunset. Farewell, comrade.",
  "{user} triggered the Return Warp and disappeared from the map.",
  "{user} left the party... The formation feels a bit emptier now.",
  "{user} was auto-kicked by the Blacksmith for failing too many refines. 💥",
  "{user} used Stealth Walk... and now they're gone. Maybe.",
  "{user}'s party slot is now open. LF1M for emotional support.",
  "{user} answered the call of another realm. May their story continue elsewhere.",
  "{user}'s name was etched into the Book of Departed Heroes.",
  "{user} left to chase whispers of a lost treasure beyond El Scaro.",
  "{user} faded like a memory in Hora Diomedea.",
  "{user} now walks the silent roads of forgotten adventurers.",
  "{user} has logged off for the last time... but their presence lingers.",
  "{user}, the guild won’t be the same without your spirit.",
  "Some adventurers leave, but their impact stays. Farewell, {user}.",
  "{user} has moved on, but the bonds forged remain unbroken.",
  "Even if you're no longer in the guild, you’ll always be part of our story, {user}.",
  "{user} rage quit after failing +15 refine. Can’t blame them.",
  "{user} tried to solo Venena... and hasn’t been seen since.",
  "{user} tripped over a Mini Boss and rolled out of the server.",
  "{user} forgot to feed their Pet and was dragged out by it.",
  "{user} hit the logout button thinking it was jump. Oops.",
];

export const giveawayStartMessages = [
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

export const boostMessages = [
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

export const welcomeMessages = [
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
];

export const raidMessages = [
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
