// this method will run once the bot is ready and get access to all guilds the bot is in
import { Client, ColorResolvable, Guild } from "discord.js";
import Config from "../../models/configSchema";
import { IConfig, ILevelRoles } from "../../utils/interfaces";

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
export const execute = async (client: Client, guild: Guild) => {
  try {
    const guildId = guild.id;
    const adminId = guild.ownerId;

    const existingGuild = await Config.findOne({ serverID: guildId });

    if (!existingGuild) {
      if (!client.user) return;

      // create level roles
      const levelRolesConfig: ILevelRoles[] = await Promise.all(
        levelRoles.map(async (level) => {
          const newRole = await guild.roles.create({
            name: level.name,
            color: level.color,
            reason: `Auto-generated for leveling system level (${level.minLevel}-${level.maxLevel})`,
          });

          console.log(
            `✅ Role ${newRole.name} created for server ${guild.name}`
          );

          return {
            minLevel: level.minLevel,
            maxLevel: level.maxLevel,
            roleID: newRole.id,
          };
        })
      );

      const configOptions: IConfig = {
        serverID: guildId,
        botID: client.user.id,
        devsIDs: [adminId],
        blacklistedChannels: [],
        ignoredChannels: [],
        levelRoles: levelRolesConfig,
        notificationChannelID: "",
        xpCooldown: 20000,
      };

      const newConfig = new Config(configOptions);

      await newConfig.save();

      console.log(`☑️ Server ${guild.name} added to configs.`);
    }
  } catch (err) {
    console.error(err);
  }
};
