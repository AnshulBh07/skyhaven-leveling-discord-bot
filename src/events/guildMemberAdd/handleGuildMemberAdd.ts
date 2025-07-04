import {
  AttachmentBuilder,
  ChannelType,
  Client,
  EmbedBuilder,
  GuildMember,
} from "discord.js";
import { createNewUser } from "../../utils/createNewUser";
import { welcomeMessages } from "../../data/helperArrays";
import { getRandomImage, getThumbnail } from "../../utils/commonUtils";
import getAllFiles from "../../utils/getAllFiles";
import path from "path";
import Config from "../../models/configSchema";

const execute = async (client: Client, member: GuildMember) => {
  try {
    if (member.user.bot) return;

    await createNewUser(client, member.guild.id, member.id);

    const guild = member.guild;

    const guildConfig = await Config.findOne({ serverID: guild.id });
    if (!guildConfig) return;

    const { moderationConfig } = guildConfig;
    const { welcomeChannelID } = moderationConfig;

    const thumbnail = getThumbnail();

    const allImages = getAllFiles(
      path.join(__dirname, "..", "assets/images/welcome_msg"),
      false
    );

    const generateWelcomeEmbed = (message: string, guildName: string) => {
      const welcomeEmbed = new EmbedBuilder()
        .setTitle(`🛬 Welcome to ${guildName}!`)
        .setDescription(
          [
            message,
            "",
            "But before you take off on your adventure, we need to verify you're part of the guild. Follow the steps below:",
            "",
            "__**How to Verify:**__",
            "📌 **Step 1:** Go to the `#verification` channel.",
            "📝 **Step 2:** Type your **IGN** (in-game name).",
            "📱 **Step 3:** Open Toram → Menu → Community → Guild.",
            "📸 **Step 4:** Take a screenshot of your **guild page**.",
            "📤 **Step 5:** Send **both** your IGN and screenshot.",
            "",
            "⏳ Once done, hang tight! We'll verify you shortly.",
          ].join("\n")
        )
        .setColor("Blue")
        .setImage("attachment://guildImg.png")
        .setThumbnail("attachment://thumbnail.png")
        .setFooter({ text: `${guildName} • Let the adventure begin!` })
        .setTimestamp();

      return welcomeEmbed;
    };

    const guildImg = new AttachmentBuilder(getRandomImage(allImages)).setName(
      "guildImage.png"
    );

    // get welcome channel
    const welcomeChannel = await guild.channels.fetch(welcomeChannelID, {
      force: true,
    });

    // send a welcome message regardless
    //   send welcome message
    if (welcomeChannel && welcomeChannel.type === ChannelType.GuildText) {
      // generate welcome embed
      const randomMessage = welcomeMessages[
        Math.floor(Math.random() * welcomeMessages.length)
      ].replace("userId", member.user.id);

      await welcomeChannel.send({
        embeds: [generateWelcomeEmbed(randomMessage, guild.name)],
        files: [thumbnail, guildImg],
      });
    }
  } catch (err) {
    console.error(err);
  }
};

export default execute;
