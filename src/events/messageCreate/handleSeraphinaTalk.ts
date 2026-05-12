import { ChannelType, Client, Message } from "discord.js";
import Config from "../../models/configSchema";
import { generateSeraphinaConvoReply } from "../../utils/LLMUtils/generateSeraphinaConvoReply";
import {
  getIntentScore,
  matchCommand,
} from "../../utils/commandKnowledgeBaseUtils";
import { generateCommandQueryReply } from "../../utils/LLMUtils/generateCommandQueryReply";
import { seraphinaAnalyzeImage } from "../../utils/LLMUtils/seraphinaImageAnalysis";

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
      ([_, atch]) => atch
    );

    // message contains an image, user is most likely asking for an analysis so do it
    if (
      msg_attachments.length &&
      msg_attachments.every((attachment) =>
        attachment.contentType?.includes("image/")
      )
    ) {
      // send only the first image
      const imageAnalysisResult = await seraphinaAnalyzeImage(
        message.author.id,
        msg_attachments[0],
        userMsg,
        seraphinaMood
      );

      await channel.send({ content: imageAnalysisResult });
      return;
    }

    // first check if it is a command query
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
        message.author.id
      );

      await channel.send({ content: commandReply });
      return;
    }

    const seraphinaReply = await generateSeraphinaConvoReply(
      seraphinaMood,
      message.author.id,
      userMsg
    );

    await channel.send({ content: seraphinaReply });
  } catch (err) {
    console.error("Error while talking to seraphina :", err);
  }
};

export default execute;
