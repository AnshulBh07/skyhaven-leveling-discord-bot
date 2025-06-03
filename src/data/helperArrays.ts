import path from "path";
import { IUser } from "../utils/interfaces";
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
  ["Staff", path.resolve(__dirname, "../assets/images/staff.png")],
  ["Partner", path.resolve(__dirname, "../assets/images/partner.png")],
  [
    "HypeSquadOnlineHouse1",
    path.resolve(__dirname, "../assets/images/bravery.png"),
  ],
  [
    "HypeSquadOnlineHouse2",
    path.resolve(__dirname, "../assets/images/brilliance.png"),
  ],
  [
    "HypeSquadOnlineHouse3",
    path.resolve(__dirname, "../assets/images/balance.png"),
  ],
  [
    "BugHunterLevel1",
    path.resolve(__dirname, "../assets/images/bughunter_1.png"),
  ],
  [
    "BugHunterLevel2",
    path.resolve(__dirname, "../assets/images/bughunter_2.png"),
  ],
  [
    "EarlySupporter",
    path.resolve(__dirname, "../assets/images/early_supporter.png"),
  ],
  [
    "VerifiedDeveloper",
    path.resolve(__dirname, "../assets/images/developer.png"),
  ],
  [
    "CertifiedModerator",
    path.resolve(__dirname, "../assets/images/certified_moderator.png"),
  ],
  [
    "ActiveDeveloper",
    path.resolve(__dirname, "../assets/images/active_developer.png"),
  ],
  [
    "HypeSquad",
    path.resolve(__dirname, "../assets/images/hypesquad_events.png"),
  ],
  [
    "PremiumEarlySupporter",
    path.resolve(__dirname, "../assets/images/early_supporter.png"),
  ],
  ["ServerBooster", path.resolve(__dirname, "../assets/images/boosting_1.png")],
  ["Nitro", path.resolve(__dirname, "../assets/images/nitro.png")],
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

export const sampleUsers: IUser[] = Array.from({ length: 55 }, (_, i) => {
  const xpPerDay = new Map<string, number>();

  // Generate XP for the last 40 days
  for (let d = 0; d < 40; d++) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const formatted = date.toISOString().split("T")[0]; // 'YYYY-MM-DD'
    xpPerDay.set(formatted, Math.floor(Math.random() * 100)); // Random XP 0–99
  }

  const textXp = Math.floor(Math.random() * 2000);
  const voiceXp = Math.floor(Math.random() * 3000);
  const totalXp = textXp + voiceXp;

  return {
    userID: `10000000000000${i + 1}`,
    username: `User${i + 1}`,
    nickname: `CoolUser${i + 1}`,
    serverID: "123456789012345678",
    leveling: {
      xp: Math.floor(Math.random() * 1000),
      textXp,
      voiceXp,
      totalXp,
      xpPerDay,
      level: Math.floor(Math.random() * 20) + 1,
      lastMessageTimestamp: new Date(Date.now() - Math.random() * 1000000000),
      lastPromotionTimestamp: new Date(Date.now() - Math.random() * 1000000000),
      currentRole: "",
    },
  };
});

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
