import path from "path";

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
