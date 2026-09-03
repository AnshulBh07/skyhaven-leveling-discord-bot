"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchEmojis = void 0;
const fetchEmojis = (client, emoji_id) => {
    try {
        if (!emoji_id.length)
            return "✨";
        let emoji = client.emojis.cache.get(emoji_id);
        return emoji ? emoji.toString() : "✨";
    }
    catch (err) {
        console.error(`Error while fetching emoji ${emoji_id} : `, err);
        return "✨";
    }
};
exports.fetchEmojis = fetchEmojis;
