import { ChannelType, Client, GuildMember } from "discord.js";
import Config from "../../models/configSchema";
import { serverBoostMessages } from "../../data/helperArrays";

// this file detects server boost from a user and sends a message
const execute = async (
  client: Client,
  oldMember: GuildMember,
  newMember: GuildMember
) => {
  try {
    // check for server boost
    if (!oldMember.premiumSince && newMember.premiumSince) {
      const guild = await client.guilds.fetch({ guild: newMember.guild.id });

      const guildConfig = await Config.findOne({
        serverID: newMember.guild.id,
      });

      if (!guildConfig) return;

      const { serverBoostChannelID } = guildConfig.moderationConfig;
      const { seraphinaMood } = guildConfig.moodConfig;

      const channel = await guild.channels.fetch(serverBoostChannelID, {
        force: true,
      });

      if (!channel || channel.type !== ChannelType.GuildText) return;

      const moodMessageArr = serverBoostMessages[seraphinaMood];

      if (!moodMessageArr.length) return;

      const message = moodMessageArr[
        Math.floor(Math.random() * moodMessageArr.length)
      ].replace("userId", newMember.id);

      await channel.send({ content: message });
    }
  } catch (err) {
    console.error("Error while detecting server boosts : ", err);
  }
};

export default execute;
