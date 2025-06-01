// this method will run once the bot is ready and get access to all guilds the bot is in
import { Client, ColorResolvable, Guild } from "discord.js";
import Config from "../../models/configSchema";
import { IConfig, ILevelRoles } from "../../utils/interfaces";
import { createNewUser } from "../../utils/createNewUser";

type LevelRole = {
  name: string;
  minLevel: number;
  maxLevel: number;
  color: ColorResolvable;
};

export const levelRoles: LevelRole[] = [
  {
    name: "Certified Lurker",
    minLevel: 1,
    maxLevel: 5,
    color: "#808080", // Gray
  },
  {
    name: "Yapmaster Apprentice",
    minLevel: 6,
    maxLevel: 10,
    color: "#1E90FF", // Dodger Blue
  },
  {
    name: "Message Goblin",
    minLevel: 11,
    maxLevel: 20,
    color: "#32CD32", // Lime Green
  },
  {
    name: "Keyboard Crusader",
    minLevel: 21,
    maxLevel: 30,
    color: "#FFA500", // Orange
  },
  {
    name: "Legendary Typist",
    minLevel: 31,
    maxLevel: 50,
    color: "#8A2BE2", // Blue Violet
  },
  {
    name: "The Yapfather",
    minLevel: 51,
    maxLevel: 70,
    color: "#FF69B4", // Hot Pink
  },
  {
    name: "Chat Ascendant",
    minLevel: 71,
    maxLevel: Infinity,
    color: "#FFD700", // Gold
  },
];

// if a certain guild config is not present in config we will create it
export const execute = async (client: Client) => {
  try {
    const guildId = "1375348405630402582";
    const adminId = "419373088614907904";

    const existingGuild = await Config.findOne({ serverID: guildId });

    const guild = await client.guilds.fetch(guildId);
    const guild_members = Array.from(guild.members.cache.entries()).map(
      ([_, member]) => member.user
    );

    // register fresh user for all guild members
    for (const member of guild_members) {
      // no bots to register as roles
      if (!member.bot) await createNewUser(client, guildId, member.id, true);
    }

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

    const configOptions: IConfig = {
      serverID: guildId,
      botID: client.user.id,
      devsIDs: [adminId],
      levelConfig: {
        levelRoles: levelRolesConfig,
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
        welcomeChannelID: "",
        welcomeMessage: "",
      },
      users: [],
    };

    const newConfig = new Config(configOptions);

    await newConfig.save();

    console.log(`☑️ Server ${guild.name} added to configs.`);
  } catch (err) {
    console.error(err);
  }
};
