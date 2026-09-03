import { ChannelType, Client, Message } from "discord.js";
import { getCachedGuildConfig } from "../../utils/configCache";
import { matchPDFFile } from "../../utils/toramKnowledgeQueryUtils";
import { generateToramReply } from "../../utils/LLMUtils/generateToramKnowledgeReply";

const execute = async (client: Client, message: Message) => {
  try {
    const channel = message.channel;
    const msg = message.content;
    const guild = message.guild;

    if (!msg.startsWith("t!") && !msg.startsWith("T!")) return;

    if (!guild || !channel || channel.type !== ChannelType.GuildText) return;

    const guildConfig = await getCachedGuildConfig(guild.id);

    if (!guildConfig) return;

    const { moodConfig } = guildConfig;
    const { seraphinaMood } = moodConfig;

    const query = msg.slice(2).trim();

    // find which file is needed
    const normalizedMsg = query.toLowerCase().replace(/[^\w\s/]/g, "");
    const file = matchPDFFile(normalizedMsg);

    const reply = await generateToramReply(
      message.author.id,
      seraphinaMood,
      query,
      file
    );

    await channel.send({ content: reply });
  } catch (err) {
    console.error("Error in toram query event : ", err);
  }
};

export default execute;
