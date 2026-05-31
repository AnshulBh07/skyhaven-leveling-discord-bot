import { ChannelType, Client, Message } from "discord.js";
import Config from "../../models/configSchema";
import { generateSeraphinaConvoReply } from "../../utils/LLMUtils/generateSeraphinaConvoReply";
import {
	getIntentScore,
	matchCommand,
} from "../../utils/commandKnowledgeBaseUtils";
import { generateCommandQueryReply } from "../../utils/LLMUtils/generateCommandQueryReply";
import { seraphinaAnalyzeImage } from "../../utils/LLMUtils/seraphinaImageAnalysis";
import ChatMemory from "../../models/chatMemorySchema";
import { StoredChatMemory } from "../../utils/interfaces";
import { retriveRelatedMemories } from "../../cognition/vector/retrieveMemories";
import { CognitionQueue } from "../../cognition/queues.ts/cognitionQueue";

// Flow for cognition and reply is given below, we try to simulate human thinking
// message
// ↓
// detect type
// ↓
// retrieve memories (so that new reply has knowledge of older one too)
// ↓
// generate reply
// ↓
// send reply
// ↓
// run cognition pipeline using a queueud worker

const execute = async (client: Client, message: Message) => {
	try {
		const guild = message.guild;
		const channel = message.channel;
		const msg = message.content;

		if (
			!guild ||
			!channel ||
			channel.type != ChannelType.GuildText ||
			!message.content.length
		)
			return;

		if (!msg.startsWith("s!") && !msg.startsWith("S!")) return;

		const guildConfig = await Config.findOne({ serverID: guild.id });

		if (!guildConfig) return;

		const { seraphinaMood } = guildConfig.moodConfig;

		const userMsg = msg.slice(2).trim();
		// console.log("Seraphina mood is : ", seraphinaMood);

		// check if the message has images alongside content
		const msg_attachments = Array.from(message.attachments.entries()).map(
			([_, atch]) => atch,
		);

		// message contains an image, user is most likely asking for an analysis so do it
		if (
			msg_attachments.length &&
			msg_attachments.every((attachment) =>
				attachment.contentType?.includes("image/"),
			)
		) {
			// send only the first image
			const imageAnalysisResult = await seraphinaAnalyzeImage(
				message.author.id,
				msg_attachments[0],
				userMsg,
				seraphinaMood,
			);

			await channel.send({ content: imageAnalysisResult });
			return;
		}

		// first check if it is a command query, if so generate a command query reply
		if (getIntentScore(userMsg) > 5) {
			// get command
			const normalizedMsg = userMsg.toLowerCase().replace(/[^\w\s/]/g, "");
			const command = matchCommand(normalizedMsg);

			if (!command) {
				await channel.send({
					content:
						"Hmm… I’m not sure which command that was about. Can you rephrase it?",
				});
				return;
			}

			const commandReply = await generateCommandQueryReply(
				userMsg,
				command,
				seraphinaMood,
				message.author.id,
			);

			await channel.send({ content: commandReply });
			return;
		}

		// run cognition pipeline, pass current user message and old seraphina reply
		// retrieve from last message chat memories (bound to be from seraphina)
		let interaction = "",
			pastMemories = "";

		const userChats = (await ChatMemory.findOne({
			userID: message.author.id,
		})) as StoredChatMemory;

		if (userChats) {
			const chats = userChats.messages;

			if (
				chats.length > 0 &&
				chats[chats.length - 1].role === "model" &&
				chats[chats.length - 1].content.length > 0
			) {
				// form interaction that contains last seraphina message + current user message
				interaction = `Previous Seraphina reply : ${chats[chats.length - 1].content}
				Current ${message.author.displayName} message : ${userMsg}`;
			}
		}

		if (!interaction.length) {
			interaction = `
			Current ${message.author.displayName} message:
			${userMsg}
			`;
		}

		try {
			pastMemories = await retriveRelatedMemories(
				interaction,
				message.author.id,
			);
		} catch (err) {
			console.error("Memory retrieval failed : ", err);
		}

		// also retrieve channel history to give seraphina a better context
		const recentMsgs = await channel.messages.fetch({ limit: 20 });

		const channelContext = recentMsgs
			.reverse()
			.map((msg) => {
				const speaker = msg.author.bot
					? "Seraphina"
					: msg.member?.displayName || msg.author.username;

				return `${speaker} : ${msg.content.replace(/^!s/i, "")}`;
			})
			.join("\n");

		// generate normal reply with convo prompt
		const seraphinaReply = await generateSeraphinaConvoReply(
			seraphinaMood,
			message.author.id,
			userMsg,
			pastMemories,
			channelContext,
		);

		await channel.send({ content: seraphinaReply });

		if (CognitionQueue.length >= 100) {
			console.warn("Cognition queue full, dropping job");
			return;
		}

		// push cognition in queue
		CognitionQueue.push({
			id: crypto.randomUUID(),
			userId: message.author.id,
			interaction: interaction,
			createdAt: Date.now(),
		});
	} catch (err) {
		console.error("Error while talking to seraphina :", err);
	}
};

export default execute;
