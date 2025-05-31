import {
  ApplicationCommandSubCommandData,
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  Client,
  PermissionResolvable,
} from "discord.js";
import {  ObjectId } from "mongoose";

// interface choices {
//   name: string;
//   value: string | number;
// }

// export interface IOptions {
//   name: string;
//   description: string;
//   type: number;
//   min_value?: number;
//   max_value?: number;
//   required?: boolean;
//   channel_types?: ChannelType[];
//   choices?: choices[];
// }

export interface ICommandObj extends ChatInputApplicationCommandData {
  isDeleted?: boolean;
  devOnly?: boolean;
  permissionsRequired?: PermissionResolvable[];

  callback: (
    client: Client,
    interaction: ChatInputCommandInteraction
  ) => Promise<void> | void;
}

export interface ILevelRoles {
  minLevel: number;
  maxLevel: number;
  roleID: string;
}

interface ILevelConfig {
  levelRoles: ILevelRoles[];
  notificationChannelID: string;
  blacklistedChannels: string[];
  ignoredChannels: string[];
  xpCooldown: number;
  xpFromEmojis: boolean;
  xpFromReactions: boolean;
  xpFromText: boolean;
  xpFromStickers: boolean;
  xpFromAttachments: boolean;
  xpFromEmbeds: boolean;
  xpFromVoice: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ILeveling {
  xp: number;
  totalXp: number;
  voiceXp: number;
  xpPerDay: Map<string, number>;
  level: number;
  lastMessageTimestamp: Date;
  lastPromotionTimestamp: Date;
  currentRole: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUser {
  userID: string;
  serverID: string;
  username: string;
  nickname: string;
  leveling: ILeveling;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IModerationConfig {
  welcomeMessage: string;
  welcomeChannelID: string;
}

export interface IConfig {
  serverID: string;
  botID: string;
  devsIDs: string[];
  levelConfig: ILevelConfig;
  moderationConfig: IModerationConfig;
  users: ObjectId[] | IUser[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISubcommand {
  data: ApplicationCommandSubCommandData;
  isSubCommand: boolean;

  callback: (
    client: Client,
    interaction: ChatInputCommandInteraction
  ) => Promise<void> | void;
}

export interface ICardRankData {
  currentXp: number;
  requiredXp: number;
  rank: number;
  level: number;
}

export interface ILevelCardUserData {
  user_id: string;
  previous_level: number;
  current_level: number;
}
