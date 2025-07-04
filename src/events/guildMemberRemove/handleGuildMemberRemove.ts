import { ChannelType, Client, GuildMember } from "discord.js";
import Config from "../../models/configSchema";
import User from "../../models/userSchema";
import { farewellMessages } from "../../data/helperArrays";

const execute = async (client: Client, member: GuildMember) => {
  try {
    // remove the member from guild config and send a farewell message on farewell channel
    const guild = member.guild;
    const userID = member.user.id;

    const guildConfig = await Config.findOne({ serverID: guild.id });

    if (!guildConfig) return;

    const { moderationConfig } = guildConfig;
    const { farewellChannelID } = moderationConfig;

    const farewellChannel = await guild.channels.fetch(farewellChannelID, {
      force: true,
    });

    const user = await User.findOne({ userID: userID });

    if (!user) return;

    await Config.updateOne(
      { serverID: guild.id },
      { $pull: { users: user._id } }
    );

    if (farewellChannel && farewellChannel.type === ChannelType.GuildText) {
      await farewellChannel.send({
        content: farewellMessages[
          Math.floor(Math.random() * farewellMessages.length)
        ].replace("{user}", member.user.tag),
      });
    }
  } catch (err) {
    console.error("Error in farewell handler", err);
  }
};

export default execute;
