// this method will run once the bot is ready and get access to all guilds the bot is in
import { Client, ColorResolvable } from "discord.js";
import Config from "../../models/configSchema";
import { IConfig, IGiveawayRoles, ILevelRoles } from "../../utils/interfaces";
import { createNewUser } from "../../utils/createNewUser";
import { giveawayRoles, levelRoles } from "../../data/helperArrays";

// if a certain guild config is not present in config we will create it
const execute = async (client: Client) => {
  try {
    const guildId = "1375348405630402582";
    const adminId = "419373088614907904";

    const existingGuild = await Config.findOne({ serverID: guildId });

    const guild = await client.guilds.fetch(guildId);
    const guild_members = Array.from(guild.members.cache.entries()).map(
      ([_, member]) => member.user
    );

    if (!guild || !client.user || existingGuild) return;

    // create level roles
    const levelRolesConfig: ILevelRoles[] = await Promise.all(
      levelRoles.map(async (levelRole) => {
        // first check if the guild already has this particular role to avoid duplicate role creations
        const existingRole = guild.roles.cache.find(
          (role) => role.name === levelRole.name
        );

        if (existingRole) {
          console.log(
            `‼️ Role ${existingRole.name} already exists in guild ${guild.name}`
          );
          const existingRoleFromArray = levelRoles.find(
            (role) => role.name === existingRole.name
          );

          return {
            minLevel: existingRoleFromArray?.minLevel || 1,
            maxLevel: existingRoleFromArray?.maxLevel || 5,
            roleID: existingRole.id,
          };
        }

        const newRole = await guild.roles.create({
          name: levelRole.name,
          color: levelRole.color,
          reason: `Auto-generated for leveling system level (${levelRole.minLevel}-${levelRole.maxLevel})`,
        });

        console.log(`✅ Role ${newRole.name} created for server ${guild.name}`);

        return {
          minLevel: levelRole.minLevel,
          maxLevel: levelRole.maxLevel,
          roleID: newRole.id,
        };
      })
    );

    // create giveaway roles
    const giveawayRolesConfig: IGiveawayRoles[] = await Promise.all(
      giveawayRoles.map(async (giveawayRole) => {
        // first check if the rolw already exists in guild, should be case sensitive
        const existingRole = guild.roles.cache.find(
          (role) => role.name === giveawayRole.name
        );

        // if already exists in guild
        if (existingRole) {
          console.log(
            `‼️ Role ${existingRole.name} already exists in guild ${guild.name}`
          );

          return { roleID: existingRole.id, name: existingRole.name };
        }

        // if doesn't exist create role
        const newRole = await guild.roles.create({
          name: giveawayRole.name,
          color: giveawayRole.color as ColorResolvable,
          reason: `Auto-generated for Giveaway system`,
        });

        console.log(`✅ Role ${newRole.name} created for server ${guild.name}`);

        return { roleID: newRole.id, name: newRole.name };
      })
    );

    const configOptions: IConfig = {
      serverID: guildId,
      botID: client.user.id,
      levelConfig: {
        levelRoles: levelRolesConfig,
        managerRoles: [],
        notificationChannelID: "",
        blacklistedChannels: [],
        ignoredChannels: [],
        xpCooldown: 5000,
        xpFromAttachments: true,
        xpFromEmbeds: true,
        xpFromEmojis: true,
        xpFromReactions: true,
        xpFromStickers: true,
        xpFromText: true,
        xpFromVoice: true,
      },
      moderationConfig: {
        botAdminIDs: [adminId],
        welcomeChannelID: "",
        welcomeMessage: "",
        farewellMessage: "",
        farewellChannelID: "",
      },
      giveawayConfig: {
        giveawayRole: "",
        managerRoles: [],
        banList: [],
        giveawayChannelID: "",
        roles: giveawayRolesConfig,
      },
      gquestMazeConfig: {
        mazeChannelID: "",
        gquestChannelID: "",
        gquestRole: "",
        mazeRole: "",
        managerRoles: [],
        gquestRewardAmount: 0,
        mazeRewardAmount: 0,
      },
      raidConfig: {
        raidChannelID: "",
        raidRole: "",
        raidDay: 5,
        raidTime: "22:30",
        managerRoles: [],
        tankEmojiID: "",
        dpsEmojiID: "",
        supportEmojiID: "",
        banList: [],
      },
      users: [],
    };

    const newConfig = new Config(configOptions);

    await newConfig.save();

    // register fresh user for all guild members
    for (const member of guild_members) {
      // no bots to register as roles
      if (!member.bot) await createNewUser(client, guildId, member.id, true);
    }

    console.log(`☑️ Server ${guild.name} added to configs.`);
  } catch (err) {
    console.error(err);
  }
};

export default execute;
