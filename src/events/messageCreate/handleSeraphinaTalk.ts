import { ChannelType, Client, Message } from "discord.js";
import Config from "../../models/configSchema";
import { generateSeraphinaConvoReply } from "../../utils/LLMUtils/generateSeraphinaConvoReply";

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

    // console.log("Seraphina mood is : ", seraphinaMood);

    const seraphinaReply = await generateSeraphinaConvoReply(
      seraphinaMood,
      message.author.id,
      message.content
    );

    await channel.send({ content: seraphinaReply });
  } catch (err) {
    console.error("Error while talking to seraphina :", err);
  }
};

export default execute;
