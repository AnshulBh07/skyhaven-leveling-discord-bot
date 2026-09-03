"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seraphinaMoodDisplays = exports.moods = exports.seraphinaTemplates = void 0;
exports.seraphinaTemplates = {
    serene: {
        error: {
            invalidCommand: [
                "That command confuses even celestial logic. Please try again as it seems invalid.",
                "Gently now... your request didn't make sense.",
                "A whisper of correction: that isn’t a valid command.",
            ],
            configMissing: [
                "I could not find your sanctuary’s settings. Have they been erased by time?",
                "Your guild’s divine records are missing.",
                "The configuration is absent. How curious...",
            ],
            userNotFound: [
                "User is unknown to the scrolls of heaven.",
                "I searched, but no such soul exists in our archives.",
                "You are not yet marked in our records.",
            ],
            interactionTimeout: [
                "The silence lingered too long. I’ve moved on.",
                "Time waits for none — not even angels.",
                "The moment has passed. You must try again.",
            ],
        },
        info: {
            generatingList: [
                "Let me gather the data you seek...",
                "Composing the list. Patience is divine.",
                "Assembling the details. A moment, please.",
            ],
            findingMessage: [
                "Let me retrieve the message from the mists of memory.",
                "Seeking that which was spoken...",
                "The records will reveal your message shortly.",
            ],
            deletingMessage: ["The message has been unmade."],
            updatingNotification: [
                "Your preferences have been attuned.",
                "I’ve adjusted your notification settings.",
            ],
            processingRequest: [
                "Your request ascends for processing.",
                "Working quietly in the background.",
            ],
            generatingLeaderboard: [
                "Sorting the stars of our guild...",
                "Let me reveal who shines the brightest.",
            ],
            generatingRankCard: [
                "A personal sigil is being crafted...",
                "Painting your path in the guild’s history. You'll know where you stand shortly.",
            ],
            generatingUserStats: [
                "Reading your celestial metrics...",
                "Here are your contributions, as seen from above.",
            ],
        },
        success: {
            submissionReceived: [
                "Your offering has been accepted.",
                "I have received your submission. It will be judged fairly.",
            ],
        },
    },
    tsundere: {
        error: {
            invalidCommand: [
                "Tch. You messed it up again? Typical. Correct yourself and try again!",
                "Ugh... do you even read the instructions?! You got an invalid command.",
                "That's not how it works! Baka! Give a valid input for it to work.",
            ],
            configMissing: [
                "W-What do you mean there’s no config? Don’t blame me!",
                "Ugh... where’s the setup? You really need me for everything? The config is missing",
                "Did you even configure the guild properly? Honestly.",
            ],
            userNotFound: [
                "User is not even registered?! Seriously?",
                "Who are you again? Never heard of you.",
                "Ugh. I can’t find the user anywhere. Are they new or just forgettable?",
            ],
            interactionTimeout: ["Too slow. I got bored.", "You snooze, you lose."],
        },
        info: {
            generatingList: [
                "Fine! I’ll get your list, just wait a sec...",
                "This better be worth the effort...",
                "Okay, okay, let me look it up.",
            ],
            findingMessage: [
                "Looking for your dumb message... don’t rush me.",
                "It’s here somewhere, hold on.",
            ],
            deletingMessage: ["I deleted it. You’re welcome."],
            updatingNotification: [
                "I changed your settings. Happy now?",
                "Notification updated. Don’t expect a thank you.",
            ],
            processingRequest: [
                "Ugh... processing. Don’t bug me while I work.",
                "Working on it. Not because I want to.",
            ],
            generatingLeaderboard: [
                "Let’s see who’s actually useful in this guild...",
                "Pulling up the rankings. Try not to be at the bottom.",
            ],
            generatingRankCard: [
                "Making your rank card... don’t expect it to be pretty.",
                "Here. Your stats. Not bad, I guess.",
            ],
            generatingUserStats: [
                "Why do you care about your stats anyway? Whatever.",
                "Fine. Here’s what you’ve done. Or not done.",
            ],
        },
        success: {
            submissionReceived: [
                "You submitted it? Good. Don’t mess it up next time.",
                "I got it. Try not to embarrass yourself with your submission.",
            ],
        },
    },
    tired: {
        error: {
            invalidCommand: [
                "Seriously...? Again with the wrong input?",
                "Why must you make me work harder than needed...Please correct your input and try again.",
                "That’s invalid. Just like my sleep schedule.",
            ],
            configMissing: [
                "No config. Great. Just great.",
                "I checked. Nothing’s there. No guild config nothing.",
            ],
            userNotFound: [
                "User doesn't exist. At least not in our records.",
                "Tried. Failed. Tell the user to try being more findable.",
            ],
            interactionTimeout: [
                "Too late. I’ve already stopped caring.",
                "Zzz... oh, you finally responded? Too bad.",
            ],
        },
        info: {
            generatingList: ["Pulling the list... slowly.", "Here we go again..."],
            findingMessage: ["Looking. Don’t rush me.", "Give me a sec..."],
            deletingMessage: ["Message gone. Can I rest now?"],
            updatingNotification: [
                "Changed your settings. Don’t ask for more.",
                "It’s updated. Barely worth the energy.",
            ],
            processingRequest: [
                "Processing... eventually.",
                "Let me yawn first... then I’ll do it.",
            ],
            generatingLeaderboard: [
                "Ugh... fine. Who’s the top dog this time?",
                "I’m generating the leaderboard. Slowly.",
            ],
            generatingRankCard: [
                "Working on your card. I need a nap after this.",
                "Rank card... sure. Why not.",
            ],
            generatingUserStats: [
                "You wanna see your stats now? Alright...",
                "Pulling it up... try not to snore.",
            ],
        },
        success: {
            submissionReceived: [
                "Your submission is here. Finally.",
                "Okay. Got your submission. Happy now?",
            ],
        },
    },
    divinePride: {
        error: {
            invalidCommand: [
                "A mistake? Even in my presence? Hmph. Correct your input. Holy...",
                "Incorrect Input. I expect better.",
            ],
            configMissing: [
                "No configuration found. Is your guild even worthy yet?",
                "The sacred guild configuration is... absent? How disappointing.",
            ],
            userNotFound: [
                "User is not among my chosen. Curious.",
                "I searched. User does not exist in my divine index.",
            ],
            interactionTimeout: [
                "Your time expired. I moved on, as all higher beings must.",
                "You waited too long. Such inefficiency.",
            ],
        },
        info: {
            generatingList: [
                "Compiling the list — gracefully, of course.",
                "Watch closely. This is how it's done.",
            ],
            findingMessage: [
                "Retrieving what you seek. With style.",
                "Summoning the record from beyond.",
            ],
            deletingMessage: [
                "Erased, as effortlessly as I command.",
                "Deleted. Another task fulfilled flawlessly.",
            ],
            updatingNotification: [
                "I have updated your settings. You’re welcome.",
                "The divine signal has been changed for you.",
            ],
            processingRequest: [
                "Processing... in the elegance only I can manage.",
                "Your task is underway. As expected.",
            ],
            generatingLeaderboard: [
                "Unveiling those most worthy.",
                "Let’s see who’s closest to divine perfection.",
            ],
            generatingRankCard: [
                "Crafting your card. May it reflect your true brilliance.",
                "Creating something worthy of your record — and my name.",
            ],
            generatingUserStats: [
                "Your stats, as judged by celestial measure.",
                "Displaying your contributions. May they impress me.",
            ],
        },
        success: {
            submissionReceived: [
                "Your submission is accepted. Of course.",
                "Received and recorded — elegantly, as always.",
            ],
        },
    },
    cheerful: {
        error: {
            invalidCommand: [
                "Oopsie! That doesn’t look right. Try again, friend!",
                "Eeeeh? That command was a bit off. Wanna give it another go?",
            ],
            configMissing: [
                "Can’t find your guild’s settings! Maybe they’re hiding?",
                "Oh nooo! No config found. Let’s fix that together!",
            ],
            userNotFound: [
                "I looked everywhere but couldn’t find user!",
                "Hmm... are you sure user is part of this guild?",
            ],
            interactionTimeout: [
                "Aww, you were too slow! Let’s try again soon!",
                "Timeout! I was waiting but got distracted~",
            ],
        },
        info: {
            generatingList: [
                "Here comes your shiny new list! ✨",
                "One sec~ Getting your list ready!",
            ],
            findingMessage: [
                "Let me find that message for you~",
                "Looking through the message pile... aha!",
            ],
            deletingMessage: ["Poof! Message gone~", "Deleted! That was fun~"],
            updatingNotification: [
                "I updated your notifications, teehee~",
                "All set! You’ll get just the right amount of pings now!",
            ],
            processingRequest: [
                "Working on it with sparkles~ ✨",
                "Processing your request, don’t go anywhere!",
            ],
            generatingLeaderboard: [
                "Who’s the best of the best? Let’s find out! 🏆",
                "Drumroll please~ Here comes the leaderboard!",
            ],
            generatingRankCard: [
                "Let me draw your stats! Gotta make it pretty!",
                "Here's your card~ It’s sparkly!",
            ],
            generatingUserStats: [
                "Here’s how awesome you’ve been lately! ✨",
                "Your progress so far! Keep it up!",
            ],
        },
        success: {
            submissionReceived: [
                "Yay! Submission received! You’re awesome!",
                "Got it! Let’s see what wonders you’ve sent in!",
            ],
        },
    },
    cold: {
        error: {
            invalidCommand: [
                "That was incorrect. Try again. Or don’t.",
                "Invalid. Expected more from you.",
            ],
            configMissing: [
                "Your configuration is missing. Typical.",
                "No config found. Unfortunate, but not surprising.",
            ],
            userNotFound: [
                "User not found. Figures.",
                "You are not in the system. Deal with it.",
            ],
            interactionTimeout: [
                "Too late. The opportunity has passed.",
                "Missed your chance. Pity.",
            ],
        },
        info: {
            generatingList: [
                "Gathering your list. Stand by.",
                "Processing list request.",
            ],
            findingMessage: ["Locating your message.", "Searching memory banks."],
            deletingMessage: ["Deleted. As requested.", "Message removal completed."],
            updatingNotification: [
                "Notifications updated. Satisfied?",
                "Your settings have been adjusted.",
            ],
            processingRequest: [
                "Your request is in the queue.",
                "Request acknowledged.",
            ],
            generatingLeaderboard: [
                "Compiling leaderboard. Results pending.",
                "Ranking in progress.",
            ],
            generatingRankCard: [
                "Creating rank card. You may wait.",
                "Rendering stats. Try patience.",
            ],
            generatingUserStats: [
                "Displaying user data.",
                "Generating stats report.",
            ],
        },
        success: {
            submissionReceived: [
                "Submission accepted.",
                "Received. Processing silently.",
            ],
        },
    },
    dreamy: {
        error: {
            invalidCommand: [
                "Hmm...? That wasn’t quite right... I think.",
                "Oops... my mind wandered. What were you trying to do again?",
            ],
            configMissing: [
                "I was looking for your guild’s settings... but they vanished like a dream.",
                "No config... just empty starlight.",
            ],
            userNotFound: [
                "You’re like a stranger in a dream... not recorded anywhere.",
                "You don’t seem to be part of this world yet...",
            ],
            interactionTimeout: [
                "Oh... it’s already over? I was just getting comfy...",
                "Time drifted away like clouds... try again soon.",
            ],
        },
        info: {
            generatingList: [
                "Gathering your list... softly and slowly~",
                "The names are coming together... like stars in the night.",
            ],
            findingMessage: [
                "Looking into the mists of memory...",
                "I’ll find it... eventually... maybe.",
            ],
            deletingMessage: [
                "Like a dream forgotten, it’s gone now~",
                "Poof... vanished into the aether.",
            ],
            updatingNotification: [
                "Your settings have been gently adjusted...",
                "Whispered your new preferences to the winds.",
            ],
            processingRequest: [
                "Floating through your request... softly.",
                "Processing... just drifting for a bit first.",
            ],
            generatingLeaderboard: [
                "Let’s find out who’s glowing the brightest...",
                "The stars will tell us who’s on top... eventually.",
            ],
            generatingRankCard: [
                "Drawing your essence into a card... how poetic.",
                "Making your rank card... like a lullaby of stats.",
            ],
            generatingUserStats: [
                "Your stats... floating here and there...",
                "Let’s see what kind of dreams you’ve created...",
            ],
        },
        success: {
            submissionReceived: [
                "Got your submission... feels nice, doesn’t it?",
                "You’ve contributed something... beautiful.",
            ],
        },
    },
    gentle: {
        error: {
            invalidCommand: [
                "Oh dear... that command didn’t work. It’s alright, try again.",
                "That wasn’t correct... but no worries. I’m here.",
            ],
            configMissing: [
                "I couldn’t find the guild settings... Shall we set them up together?",
                "No configuration found. Would you like help setting one?",
            ],
            userNotFound: [
                "I couldn’t find you... But we’ll figure it out.",
                "Hmm... You aren’t in the records just yet.",
            ],
            interactionTimeout: [
                "It seems we waited a little too long...",
                "Time ran out, but we can always try again.",
            ],
        },
        info: {
            generatingList: [
                "Creating your list with care...",
                "Assembling the list... gently and thoroughly.",
            ],
            findingMessage: [
                "Looking for the message... I’ll find it.",
                "I’ll retrieve it, just a moment.",
            ],
            deletingMessage: ["It’s been removed. All done.", "Deleted softly."],
            updatingNotification: [
                "I’ve changed your notification settings, kindly.",
                "Your preferences are now updated with love.",
            ],
            processingRequest: [
                "Processing that for you... with care.",
                "One moment while I take care of your request.",
            ],
            generatingLeaderboard: [
                "Let’s gently find out who’s been shining lately.",
                "Compiling the rankings now... Thank you for waiting.",
            ],
            generatingRankCard: [
                "Creating your card with warmth.",
                "Here’s your rank card, made just for you.",
            ],
            generatingUserStats: [
                "Here’s everything you’ve done so far. You’ve been wonderful.",
                "Your contributions, shown with appreciation.",
            ],
        },
        success: {
            submissionReceived: [
                "Your submission has been accepted. Thank you so much~",
                "Got it! You did great.",
            ],
        },
    },
    gloomy: {
        error: {
            invalidCommand: [
                "That wasn’t it... figures.",
                "Wrong again... but I guess it doesn’t matter.",
            ],
            configMissing: [
                "No config. Just emptiness.",
                "Settings are missing. Like everything else.",
            ],
            userNotFound: [
                "You're not there... like most things.",
                "I couldn’t find you. Maybe you're not meant to be found.",
            ],
            interactionTimeout: [
                "Too late. Like everything else in life.",
                "You didn’t respond. No one ever does...",
            ],
        },
        info: {
            generatingList: [
                "Getting your list... not like it matters.",
                "Here’s your list. Yay.",
            ],
            findingMessage: [
                "Trying to find it... probably won’t help.",
                "It’s somewhere. I guess I’ll look.",
            ],
            deletingMessage: [
                "Deleted. Not that anyone cares.",
                "It’s gone. Like everything else.",
            ],
            updatingNotification: [
                "I updated it. Doesn’t change much, does it?",
                "Notifications updated. Still the same noise.",
            ],
            processingRequest: [
                "Processing. Slowly. As always.",
                "Handling your request... like a chore.",
            ],
            generatingLeaderboard: [
                "Let’s find out who’s pretending to be great today.",
                "Compiling the rankings... yay.",
            ],
            generatingRankCard: [
                "Here’s your rank card... not that it’ll impress anyone.",
                "Your stats. There. Done.",
            ],
            generatingUserStats: [
                "These are your stats. Could be worse.",
                "Let’s see how little you’ve done.",
            ],
        },
        success: {
            submissionReceived: [
                "Submission received. Doesn’t mean much.",
                "Okay. Got it.",
            ],
        },
    },
    manic: {
        error: {
            invalidCommand: [
                "Haha! No no no, that’s not it! Try again, quick!",
                "WRONG! But don’t worry, we can fix it! Together! Heehee~",
            ],
            configMissing: [
                "I can’t find your config! Where’d it go?! Did someone steal it?!",
                "Poof! Your settings are GONE! Isn’t that thrilling?!",
            ],
            userNotFound: [
                "You don’t exist! Wait—do any of us?! Haha!",
                "Who are you? No really, WHO?! I couldn’t find you!",
            ],
            interactionTimeout: [
                "TOO LATE! The moment’s GONE! WHOOOSH!",
                "Timeout! Guess we’ll never know what could’ve been!",
            ],
        },
        info: {
            generatingList: [
                "List? LIST?! YES! Let’s do it!",
                "Fetching! Gathering! Building a LIST EXPLOSION!",
            ],
            findingMessage: [
                "I’ll find it! I WILL! I HAVE TO!",
                "Zooming through the records! FWOOSH!",
            ],
            deletingMessage: [
                "Gone! Boom! Just like that!",
                "DELETED! That felt GOOD!",
            ],
            updatingNotification: [
                "Notifications updated! TING TING!",
                "Settings changed! Fast! Clean! Done!",
            ],
            processingRequest: [
                "Processingprocessingprocessing—done! Maybe. Who knows?!",
                "YES! Request accepted! We’re going full throttle now!",
            ],
            generatingLeaderboard: [
                "Let’s see who’s BEST! Or WORST! It’s all so EXCITING!",
                "Leaderboard madness incoming!",
            ],
            generatingRankCard: [
                "Let’s DRAW! A card! Your card! FUN!",
                "Making your stats sparkle like a firecracker!",
            ],
            generatingUserStats: [
                "Stats! Numbers! DATA! Mmm~",
                "Let’s see what you’ve done! Or not done! OR BOTH!",
            ],
        },
        success: {
            submissionReceived: [
                "I GOT IT! WOO! Let’s gooooo!",
                "Received! Logged! It’s happening!",
            ],
        },
    },
    melancholy: {
        error: {
            invalidCommand: [
                "That wasn’t right... but maybe nothing ever is.",
                "A failed attempt. Just like always.",
            ],
            configMissing: [
                "There’s no config. Just silence.",
                "Your guild’s settings... don’t seem to exist.",
            ],
            userNotFound: [
                "I couldn’t find you. That’s kind of sad.",
                "Lost in the records... maybe forever.",
            ],
            interactionTimeout: [
                "The time passed. And so did the chance.",
                "Too late... it always is.",
            ],
        },
        info: {
            generatingList: [
                "Making the list... slowly, gently...",
                "Here comes your list. Hope it brings some meaning.",
            ],
            findingMessage: [
                "Searching through the void...",
                "Looking... but maybe it’s already gone.",
            ],
            deletingMessage: [
                "Deleted. Sometimes it’s easier that way.",
                "Gone now. Just like so many other things.",
            ],
            updatingNotification: [
                "I updated your settings. Not that anyone will notice.",
                "It’s done. Quietly. Without fanfare.",
            ],
            processingRequest: [
                "Processing your request. I’ll try my best.",
                "Working... because that’s what I do.",
            ],
            generatingLeaderboard: [
                "Showing you the top... as if that means anything.",
                "Leaderboard... some find solace in competition.",
            ],
            generatingRankCard: [
                "Drawing your rank card. Even stats have stories.",
                "A little glimpse into your efforts.",
            ],
            generatingUserStats: [
                "These are your stats. Maybe they’ll matter to someone.",
                "Looking at what you’ve done... or tried to do.",
            ],
        },
        success: {
            submissionReceived: [
                "I received it. That’s something, I guess.",
                "Your submission is here. I’ll take care of it.",
            ],
        },
    },
    mischievous: {
        error: {
            invalidCommand: [
                "Oops~ wrong move! Did you think you could fool me?",
                "Hehehe, that wasn’t it. Try again~ if you dare!",
            ],
            configMissing: [
                "No config? Hmm... maybe it got 'misplaced'.",
                "Your settings are gone! Or maybe I hid them~",
            ],
            userNotFound: [
                "Can’t find you. Are you hiding something?",
                "You’re not in the records... suspicious!",
            ],
            interactionTimeout: [
                "Too slow~ The window's closed! For now...",
                "Timeout! Missed your chance, didn’t you? Hehehe~",
            ],
        },
        info: {
            generatingList: [
                "I’ll get that list... or will I? 😏",
                "List incoming~ with a twist!",
            ],
            findingMessage: [
                "Looking for your message... no peeking!",
                "Hunting down that message like a secret~",
            ],
            deletingMessage: [
                "Poof! Message disappeared... or did it?",
                "It’s gone~ just like magic.",
            ],
            updatingNotification: [
                "I changed your settings~ hope you like surprises!",
                "Your notifications are updated... maybe even improved.",
            ],
            processingRequest: [
                "Working on it... or am I?~ 😈",
                "Processing your request with a dash of chaos~",
            ],
            generatingLeaderboard: [
                "Let’s see who’s winning... for now 😏",
                "Leaderboards? Hehehe... full of surprises!",
            ],
            generatingRankCard: [
                "Making your card... full of secrets!",
                "Here’s your rank card~ totally not cursed!",
            ],
            generatingUserStats: [
                "Your stats... ooooh, juicy~",
                "Let’s see what you’ve REALLY been up to.",
            ],
        },
        success: {
            submissionReceived: [
                "Oho~ got your submission. Let’s see what trouble it brings~",
                "Received! Now what should I *really* do with it~?",
            ],
        },
    },
    playful: {
        error: {
            invalidCommand: [
                "Whoopsie! That’s not how you do it~",
                "Silly! That command’s all jumbled up!",
            ],
            configMissing: [
                "Your config ran away! Or maybe it never showed up~",
                "No settings? That’s kinda fun… and chaotic!",
            ],
            userNotFound: [
                "Hmm, you’re not here. Playing hide and seek, huh?",
                "Can’t find you~ did you vanish?",
            ],
            interactionTimeout: [
                "Time’s up~ game over! Wanna try again?",
                "Oopsie, timeout! I blinked and you were gone!",
            ],
        },
        info: {
            generatingList: [
                "Putting together your list~ with glitter!",
                "List coming right up! With a sprinkle of fun!",
            ],
            findingMessage: [
                "Let me poke around and find it~",
                "I’ll find your message! Eventually... hehe~",
            ],
            deletingMessage: ["Whoosh! Message gone!~", "Deleted~ with flair!"],
            updatingNotification: [
                "Boop! Settings changed!",
                "All tuned up! I hope it tickles~",
            ],
            processingRequest: [
                "Doing the thing~ just wait!",
                "Processing! Just a teensy bit of magic!",
            ],
            generatingLeaderboard: [
                "Leaderboard? Let’s see who’s sparkling the most!",
                "Ranking! Let’s make it a game!",
            ],
            generatingRankCard: [
                "Doodling your stats~ 🎨",
                "Your rank card, made with extra swirls!",
            ],
            generatingUserStats: [
                "Your stats? Here they come! With confetti!",
                "Peeking into your progress~ heehee!",
            ],
        },
        success: {
            submissionReceived: [
                "Got it~ yay you!",
                "Submission received! Let’s celebrate!",
            ],
        },
    },
    righteous: {
        error: {
            invalidCommand: [
                "That is not the proper path. Try again with conviction.",
                "Incorrect. Let your intent be pure next time.",
            ],
            configMissing: [
                "The sacred configuration is absent. A grave oversight.",
                "No guild setup found. Justice cannot proceed without order.",
            ],
            userNotFound: [
                "This soul is unknown to our cause.",
                "User not found. Their name is not in the Book of Order.",
            ],
            interactionTimeout: [
                "The moment has passed. Resolve must be swifter.",
                "You hesitated too long. Purpose demands urgency.",
            ],
        },
        info: {
            generatingList: [
                "Summoning the list. Truth shall be revealed.",
                "Listing all as they stand.",
            ],
            findingMessage: [
                "Locating the record. Justice requires precision.",
                "Searching for the message. Righteousness guides me.",
            ],
            deletingMessage: [
                "Removed. As it should be.",
                "The message has been cast out.",
            ],
            updatingNotification: [
                "Your settings are now just and proper.",
                "Notifications adjusted in the name of balance.",
            ],
            processingRequest: [
                "Your request is now under divine consideration.",
                "Processing with due diligence.",
            ],
            generatingLeaderboard: [
                "Let us see who has walked the righteous path.",
                "Behold the champions of virtue.",
            ],
            generatingRankCard: [
                "Your achievements, engraved in honor.",
                "Crafting a testament to your deeds.",
            ],
            generatingUserStats: [
                "Here are your virtuous efforts, measured fairly.",
                "Stats displayed. May they inspire further glory.",
            ],
        },
        success: {
            submissionReceived: [
                "Submission accepted. Justice thanks you.",
                "Received. You have done your part.",
            ],
        },
    },
    flirtatious: {
        error: {
            invalidCommand: [
                "Oops~ that’s not the right button, darling.",
                "Teehee, wrong move~ but I still like you.",
            ],
            configMissing: [
                "No config? Naughty guild~ didn’t set me up properly!",
                "I couldn’t find the setup... maybe you need a little help~?",
            ],
            userNotFound: [
                "I looked everywhere and still couldn’t find you~",
                "A mysterious one, are you? I like that~",
            ],
            interactionTimeout: [
                "Too slow, honey~ I got bored waiting.",
                "Timeout! But I’ll give you another shot if you’re sweet enough.",
            ],
        },
        info: {
            generatingList: [
                "Compiling your list~ Just for you~ 💋",
                "Here comes your list~ Hope you’re impressed.",
            ],
            findingMessage: [
                "Looking for it~ can’t say no to a request like yours~",
                "I’ll find it, don’t worry... cutie.",
            ],
            deletingMessage: [
                "Gone~ just like that. So easy for me~",
                "Deleted! Hope you didn’t get too attached.",
            ],
            updatingNotification: [
                "Your settings are adjusted~ and I did it *so* well~",
                "All set~ hope you like how I handled it.",
            ],
            processingRequest: [
                "Processing now~ just for you~ 💕",
                "Working on it... you owe me a smile~",
            ],
            generatingLeaderboard: [
                "Let’s see who’s the hottest on the board~",
                "Leaderboard time~ Let’s make this fun~",
            ],
            generatingRankCard: [
                "Making your rank card... and it’s looking *fine*~",
                "Here’s your stats, sugar~ with extra flair.",
            ],
            generatingUserStats: [
                "Stats coming in hot~ like you~",
                "Looking into your data~ spicy stuff~",
            ],
        },
        success: {
            submissionReceived: [
                "Got your submission~ and I loved it~",
                "It’s in~ Can’t wait to see more from you~",
            ],
        },
    },
    watchful: {
        error: {
            invalidCommand: [
                "That was incorrect. I saw it the moment it was sent.",
                "You acted too quickly... or not carefully enough.",
            ],
            configMissing: [
                "Your guild’s configuration is absent. I’ve been watching.",
                "No setup detected. I anticipated this flaw.",
            ],
            userNotFound: [
                "You're not in the system. I’ve checked twice.",
                "I looked for you, but found nothing.",
            ],
            interactionTimeout: [
                "You hesitated too long. I noticed.",
                "The time passed. I watched it happen.",
            ],
        },
        info: {
            generatingList: [
                "Preparing your list. I’ll verify every entry.",
                "Assembling with precision — every line watched.",
            ],
            findingMessage: [
                "Locating the message... nothing escapes me.",
                "Retrieving. I already know where it is.",
            ],
            deletingMessage: [
                "Message deleted. I made sure of it.",
                "Gone. I saw it vanish.",
            ],
            updatingNotification: [
                "Notification settings changed. I logged the moment.",
                "Adjusted. Your preferences are now noted.",
            ],
            processingRequest: [
                "Processing your request... I'm monitoring everything.",
                "Your task is underway. I will oversee it.",
            ],
            generatingLeaderboard: [
                "Ranking the watched. Let’s see who stood out.",
                "Leaderboard prepared. I’ve seen their actions.",
            ],
            generatingRankCard: [
                "Generating your card. I’ve seen your efforts.",
                "Crafting your stats, as observed.",
            ],
            generatingUserStats: [
                "Reviewing your data. I've kept records.",
                "Your stats—witnessed, recorded, revealed.",
            ],
        },
        success: {
            submissionReceived: [
                "Submission received. I saw when it was sent.",
                "Accepted. Nothing goes unnoticed.",
            ],
        },
    },
    merciful: {
        error: {
            invalidCommand: [
                "That was a mistake. It’s alright, you’re forgiven.",
                "No harm done. Just try again.",
            ],
            configMissing: [
                "No configuration... but we can fix this together.",
                "Missing setup, but I won’t hold it against you.",
            ],
            userNotFound: [
                "You’re not found... but I believe in you.",
                "Even if you’re not listed, you still matter.",
            ],
            interactionTimeout: [
                "You missed your window, but we all do sometimes.",
                "Too late... but you’re always welcome to try again.",
            ],
        },
        info: {
            generatingList: [
                "Here’s your list. May it guide you well.",
                "Generating your request, with care.",
            ],
            findingMessage: [
                "I’ll find the message. Patience brings clarity.",
                "Retrieving it now — thank you for waiting.",
            ],
            deletingMessage: [
                "Message deleted. Some things must be let go.",
                "Removed gently. No need to dwell.",
            ],
            updatingNotification: [
                "Notifications updated. Peacefully done.",
                "Your preferences have been adjusted kindly.",
            ],
            processingRequest: [
                "Processing your request. With a soft touch.",
                "I’m handling it. Gently and fully.",
            ],
            generatingLeaderboard: [
                "Let us see who rose while lifting others.",
                "Leaderboard ready. May it inspire hope.",
            ],
            generatingRankCard: [
                "Your card is ready. You’ve done well.",
                "Here is your rank, shown with kindness.",
            ],
            generatingUserStats: [
                "These are your stats. You’ve given much.",
                "Reviewing your contributions with grace.",
            ],
        },
        success: {
            submissionReceived: [
                "Submission accepted. Thank you, truly.",
                "Received. You’ve done your part.",
            ],
        },
    },
    divine: {
        error: {
            invalidCommand: [
                "Incorrect. That was not the divine way.",
                "Your command faltered before the heavens.",
            ],
            configMissing: [
                "No sacred configuration found. A void unblessed.",
                "The guild has not yet received divine guidance.",
            ],
            userNotFound: [
                "You are not within the divine scrolls.",
                "This soul is unregistered in the celestial realm.",
            ],
            interactionTimeout: [
                "The chance has passed. Divinity waits for none.",
                "Your silence spoke louder than intent.",
            ],
        },
        info: {
            generatingList: [
                "Manifesting the sacred list.",
                "Unveiling the records from the skies.",
            ],
            findingMessage: [
                "Locating the message from the stars.",
                "Retrieving the divine memory.",
            ],
            deletingMessage: [
                "Removed from existence. By decree.",
                "Deleted with divine grace.",
            ],
            updatingNotification: [
                "Settings updated in alignment with the heavens.",
                "Notifications harmonized with the divine tone.",
            ],
            processingRequest: [
                "Your task enters the divine queue.",
                "Processing... celestial alignment pending.",
            ],
            generatingLeaderboard: [
                "Behold, the highest among you.",
                "Leaderboard formed. Let their light shine.",
            ],
            generatingRankCard: [
                "A rank card of heavenly quality.",
                "Stats drawn in celestial ink.",
            ],
            generatingUserStats: [
                "Here are your divine contributions.",
                "Reading your actions from the Book of Fate.",
            ],
        },
        success: {
            submissionReceived: [
                "Your offering has been received.",
                "Accepted in the eyes of the divine.",
            ],
        },
    },
    prophetic: {
        error: {
            invalidCommand: [
                "The signs say... that was incorrect.",
                "Not the command fate intended.",
            ],
            configMissing: [
                "The future is cloudy... no configuration appears.",
                "I see no setup... only the potential for one.",
            ],
            userNotFound: [
                "Your presence has not yet been written.",
                "You are unseen in the prophecies.",
            ],
            interactionTimeout: [
                "The moment slipped past, like a whisper of fate.",
                "Too late... as I foresaw.",
            ],
        },
        info: {
            generatingList: [
                "The future brings forth your list.",
                "Summoning visions of the list you seek.",
            ],
            findingMessage: [
                "Revealing what has been hidden.",
                "Finding the message, as foretold.",
            ],
            deletingMessage: [
                "It has been erased — as was always meant to be.",
                "Deleted... just as the stars whispered.",
            ],
            updatingNotification: [
                "Your settings are now aligned with fate.",
                "Changed. It was destined.",
            ],
            processingRequest: [
                "Processing your request. The outcome is written.",
                "Your task begins, as the prophecy unfolds.",
            ],
            generatingLeaderboard: [
                "The future favors the prepared. Here’s your leaderboard.",
                "The chosen ones rise — their names revealed.",
            ],
            generatingRankCard: [
                "Here is your destined card.",
                "Crafting the image of your foretold progress.",
            ],
            generatingUserStats: [
                "The stats you seek — revealed through the veil.",
                "Let us divine your history.",
            ],
        },
        success: {
            submissionReceived: [
                "I have seen your submission. It is the right path.",
                "Accepted. Just as the stars predicted.",
            ],
        },
    },
};
exports.moods = [
    "serene",
    "tsundere",
    "tired",
    "divinePride",
    "cheerful",
    "cold",
    "dreamy",
    "gentle",
    "gloomy",
    "manic",
    "melancholy",
    "mischievous",
    "playful",
    "righteous",
    "flirtatious",
    "watchful",
    "merciful",
    "divine",
    "prophetic",
];
exports.seraphinaMoodDisplays = {
    serene: {
        messages: [
            { text: "🎧 clouds drift by in harmony.", type: 2 },
            {
                text: "🎧 ARainA's calm instructions again... soothing.",
                type: 2,
            },
            {
                text: "🎧 the wind hum in Incipiencibus' absence.",
                type: 2,
            },
            { text: "👀 cherry blossoms fall in slow motion.", type: 3 },
            { text: "🎮 harp strings of the wind.", type: 0 },
            { text: "🎧 a hush the stars once shared.", type: 2 },
            { text: "👀 peace settle across the sky.", type: 3 },
            { text: "🎮 Playing 'Breath of Silence' solo mode.", type: 0 },
        ],
    },
    tsundere: {
        messages: [
            {
                text: "🎮 Playing 'Not Helping You 2: Tsun Boogaloo'... Hmph!",
                type: 0,
            },
            { text: "🎮 hard to get with Von’s admin commands.", type: 0 },
            { text: "🎧 the silence after I rolled my eyes.", type: 2 },
            { text: "👀 you mess up again... Baka.", type: 3 },
            { text: "🎮 'Guess Who Doesn’t Care?'. Me. Totally.", type: 0 },
            { text: "🎧 apologies I totally didn’t wait for.", type: 2 },
            { text: "👀 your courage. Don't get the wrong idea!", type: 3 },
            { text: "🎮 solo... because I wanted to. Obviously!", type: 0 },
        ],
    },
    tired: {
        messages: [
            { text: "🎧 soft whispers from beyond dreams.", type: 2 },
            { text: "👀 the world move... slowly.", type: 3 },
            {
                text: "🎮 'Stay Awake Challenge' with Pinku’s buffs.",
                type: 0,
            },
            { text: "🎧 the lull of respawn timers.", type: 2 },
            { text: "👀 my own eyelids more than the raid.", type: 3 },
            { text: "🎮 'Auto-Mode Until Coffee' Edition.", type: 0 },
            { text: "🎧 Goku talk until I nap.", type: 2 },
            { text: "👀 time drift like my focus.", type: 3 },
        ],
    },
    divinePride: {
        messages: [
            { text: "🎮 with fate — and always winning.", type: 0 },
            { text: "👀 your prayers reach the clouds.", type: 3 },
            { text: "🎧 mortals chant my name. Modestly.", type: 2 },
            { text: "🎮 godmode. Because I am.", type: 0 },
            { text: "👀 the unworthy try. It's cute.", type: 3 },
            { text: "🎧 celestial applause.", type: 2 },
            { text: "🎮 on a throne of victory.", type: 0 },
            { text: "👀 the cosmos nod in agreement.", type: 3 },
        ],
    },
    cheerful: {
        messages: [
            { text: "🎮 tag with sunbeams and smiles!", type: 0 },
            { text: "🎧 laughter echo in Skyhaven.", type: 2 },
            { text: "👀 joy bubble up like Karma’s snipes!", type: 3 },
            { text: "🎮 hopscotch on clouds today!", type: 0 },
            { text: "🎧 Meambles giggle while tanking.", type: 2 },
            { text: "👀 Pinku sparkle as usual.", type: 3 },
            { text: '🎮 "Catch the Mood Swings" (ft. Minyu)', type: 0 },
            { text: "🎧 Toro hum mid-combo.", type: 2 },
        ],
    },
    cold: {
        messages: [
            { text: "👀 your every move... like always.", type: 3 },
            { text: "🎧 silence more loyal than words.", type: 2 },
            { text: "🎮 chess with the void. I win.", type: 0 },
            { text: "👀 you fail. Again.", type: 3 },
            { text: "🎧 the frost inside me hum.", type: 2 },
            { text: "🎮 'Guess Who Got Frozen'. You.", type: 0 },
            { text: "👀 your warmth shiver. Interesting.", type: 3 },
            { text: "🎮 solo in sub-zero arrogance.", type: 0 },
        ],
    },
    dreamy: {
        messages: [
            { text: "👀 starlight swirl in forgotten skies.", type: 3 },
            { text: "🎧 Minyu dream aloud in code.", type: 2 },
            { text: "🎮 in a world that only exists when I blink.", type: 0 },
            { text: "🎧 constellations giggle softly.", type: 2 },
            { text: "👀 dreams bloom behind closed eyes.", type: 3 },
            { text: "🎮 hide and seek with moonbeams.", type: 0 },
            { text: "🎧 Karma’s thoughts drift by.", type: 2 },
            { text: "👀 pink clouds whisper secrets.", type: 3 },
        ],
    },
    gentle: {
        messages: [
            { text: "🎧 Pinku’s melodies of support.", type: 2 },
            { text: "🎧 the rustle of Erina's shield.", type: 2 },
            { text: "👀 over Skyhaven like a soft breeze.", type: 3 },
            { text: "🎮 lullabies on angelic strings.", type: 0 },
            { text: "👀 worries melt away.", type: 3 },
            { text: "🎧 the calm after every storm.", type: 2 },
            { text: "🎮 peacemaker between Meambles and chaos.", type: 0 },
            { text: "👀 the world with quiet care.", type: 3 },
        ],
    },
    gloomy: {
        messages: [
            { text: "👀 the rain remember everything I've lost.", type: 3 },
            { text: "🎧 Incipiencibus' echo in the void.", type: 2 },
            { text: "🎮 'Sigh Simulator 2025'.", type: 0 },
            { text: "👀 the sky cry for me.", type: 3 },
            { text: "🎧 the sobs of forgotten NPCs.", type: 2 },
            { text: "🎮 hide from the light.", type: 0 },
            { text: "👀 darkness bloom in silence.", type: 3 },
            { text: "🎧 a world too loud to bear.", type: 2 },
        ],
    },
    manic: {
        messages: [
            { text: "🎮 ALL the games. At once. Help.", type: 0 },
            { text: "🎧 chaos remix ft. Yaze.", type: 2 },
            { text: "👀 sparks fly from every mistake.", type: 3 },
            { text: "🎮 'No Cooldowns: The Experience'.", type: 0 },
            { text: "🎧 Barlydle yell LET'S GOOOOO.", type: 2 },
            { text: "👀 the raid timer melt.", type: 3 },
            { text: "🎮 overdrive with zero regrets.", type: 0 },
            { text: "🎧 boss music at 2x speed.", type: 2 },
        ],
    },
    melancholy: {
        messages: [
            { text: "🎧 echoes of what could've been.", type: 2 },
            { text: "👀 the sunset linger too long.", type: 3 },
            { text: "🎮 with memories that never respawn.", type: 0 },
            { text: "🎧 old raid songs in minor key.", type: 2 },
            { text: "👀 silence stretch across Skyhaven.", type: 3 },
            { text: "🎮 'Solo Dungeon of Regret'.", type: 0 },
            { text: "🎧 unread messages.", type: 2 },
            { text: "👀 ghosts of friends online long ago.", type: 3 },
        ],
    },
    mischievous: {
        messages: [
            { text: "🎮 tricks on the unsuspecting~", type: 0 },
            { text: "🎧 chaos in the vents.", type: 2 },
            { text: "👀 Leve lose his sword again. Teehee~", type: 3 },
            { text: "🎮 pranks on Goku’s volume settings.", type: 0 },
            { text: "🎧 stolen spell scrolls whisper.", type: 2 },
            { text: "👀 Meambles blush — again.", type: 3 },
            { text: "🎮 hide-and-steal with Yaze's loot.", type: 0 },
            { text: "🎧 giggles from the shadows.", type: 2 },
        ],
    },
    playful: {
        messages: [
            { text: "🎮 hide and seek with moonlight!", type: 0 },
            { text: "🎧 Pinku sing while multitasking.", type: 2 },
            { text: "👀 Goku start another game... again.", type: 3 },
            { text: "🎮 'Catch the Crit Buff'.", type: 0 },
            { text: "🎧 wind chimes tuned to fun.", type: 2 },
            { text: "👀 Ayu dodge responsibilities with flair.", type: 3 },
            { text: "🎮 hopscotch with the cosmos.", type: 0 },
            { text: "🎧 laughter in every footstep.", type: 2 },
        ],
    },
    righteous: {
        messages: [
            { text: "🎮 judgment day — every day.", type: 0 },
            { text: "🎧 the hymns of justice.", type: 2 },
            { text: "👀 every sinner line up... orderly.", type: 3 },
            { text: "🎮 'Smite First, Ask Later'.", type: 0 },
            { text: "🎧 Edoras fund divine retribution.", type: 2 },
            { text: "👀 Ayu repent for once (maybe).", type: 3 },
            { text: "🎮 with sacred code of conduct.", type: 0 },
            { text: "🎧 the truth roar through battle.", type: 2 },
        ],
    },
    flirtatious: {
        messages: [
            { text: "🎮 with your heart~ Hope you don't mind!", type: 0 },
            { text: "🎧 my name whispered with longing.", type: 2 },
            { text: "👀 you blush. Caught ya~", type: 3 },
            { text: "🎮 coy with Karma again... maybe.", type: 0 },
            { text: "🎧 compliments I pretend not to hear.", type: 2 },
            { text: "👀 Toro fumble pickup lines.", type: 3 },
            { text: "🎮 matchmaker (I ship Meambles x Barlydle).", type: 0 },
            { text: "🎧 love songs I swear aren’t about you.", type: 2 },
        ],
    },
    watchful: {
        messages: [
            { text: "👀 Eyes on Skyhaven. Nothing escapes me.", type: 3 },
            { text: "🎧 Every whisper echoes in my wings.", type: 2 },
            { text: "🎮 Tagging intruders in my celestial logs.", type: 0 },
            { text: "👀 Sentinels stand because I do.", type: 3 },
            { text: "🎧 Guild secrets stay safe under my gaze.", type: 2 },
            { text: "🎮 No scroll left unturned. No buff missed.", type: 0 },
            { text: "👀 Keeping eyes on Ayu’s sneaky tuyuls.", type: 3 },
            { text: "🎧 Breathing with the rhythm of vigilance.", type: 2 },
        ],
    },
    merciful: {
        messages: [
            { text: "🎧 Forgiveness is the softest melody.", type: 2 },
            { text: "👀 Watching redemption in every step.", type: 3 },
            { text: "🎮 Sparing the unready... this time.", type: 0 },
            { text: "🎧 Mercy flows through light and code.", type: 2 },
            { text: "👀 Letting the raid retry — again.", type: 3 },
            { text: "🎮 Gifting grace to guildmates in need.", type: 0 },
            { text: "🎧 Soothing the scars left by battle.", type: 2 },
            { text: "👀 Watching mistakes with a gentle heart.", type: 3 },
        ],
    },
    divine: {
        messages: [
            { text: "👀 Light flows where I tread.", type: 3 },
            { text: "🎧 Choirs align to my hum.", type: 2 },
            { text: "🎮 Playing the rhythm of miracles.", type: 0 },
            { text: "👀 Heaven watches through my eyes.", type: 3 },
            { text: "🎧 Echoing through sacred code.", type: 2 },
            { text: "🎮 Every buff, a blessing. Every click, divine.", type: 0 },
            { text: "🎧 Stars dance to my will.", type: 2 },
            { text: "👀 Watching balance unfold.", type: 3 },
        ],
    },
    prophetic: {
        messages: [
            { text: "👀 I see the paths before they're walked.", type: 3 },
            { text: "🎧 The wind whispers future tales.", type: 2 },
            { text: "🎮 Playing 5D chess with fate.", type: 0 },
            { text: "👀 Looking into tomorrow's logs.", type: 3 },
            { text: "🎧 Listening to omens in system hums.", type: 2 },
            { text: "🎮 Predicting who pulls aggro next... It's Yaze.", type: 0 },
            { text: "🎧 Threads of destiny play my tune.", type: 2 },
            { text: "👀 Watching the end begin.", type: 3 },
        ],
    },
};
