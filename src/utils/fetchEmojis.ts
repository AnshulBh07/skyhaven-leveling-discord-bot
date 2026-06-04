import { Client } from "discord.js";

export const fetchEmojis = (client: Client, emoji_id: string) => {
	try {
		if (!emoji_id.length) return "✨";

		let emoji = client.emojis.cache.get(emoji_id);

		return emoji ? emoji.toString() : "✨";
	} catch (err) {
		console.error(`Error while fetching emoji ${emoji_id} : `, err);
		return "✨";
	}
};
