import {
  ApplicationCommandSubCommandData,
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  Client,
  PermissionResolvable,
} from "discord.js";
import { Types } from "mongoose";

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

export interface IGiveawayRoles {
  roleID: string;
  name: string;
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
  textXp: number;
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

interface IUserGiveaways {
  isBanned: boolean;
  giveawaysWon: Types.ObjectId[];
  giveawaysEntries: Types.ObjectId[];
}

type GquestStatus = "pending" | "rewarded" | "rejected";

export interface IGquest {
  serverID: string;
  userID: string;
  messageID: string; //serves as gquest id
  channelID: string;
  imageUrl: string;
  imageHash: string;
  status: GquestStatus;
  submittedAt?: number;
  rewardedAt?: number;
  reviewedBy: string; //admin disocrd id
  rejectionReason?: string; //if rejected
  createdAt?: Date;
  updatedAt?: Date;
}

interface IUserGquests {
  pending: Types.ObjectId[];
  rewarded: Types.ObjectId[];
  rejected: Types.ObjectId[];
  lastSubmissionDate: Date | null;
  lastRewardDate: Date | null;
  lastRejectionDate: Date | null;
  totalRewarded: number;
}

interface IGquestConfig {
  gquestChannelID: string;
  role: string;
  managerRoles: string[];
  rewardAmount: number;
}

export interface IUser {
  userID: string;
  serverID: string;
  username: string;
  nickname: string;
  leveling: ILeveling;
  giveaways: IUserGiveaways;
  gquests: IUserGquests;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IModerationConfig {
  welcomeMessage: string;
  welcomeChannelID: string;
}

interface IGiveawayConfig {
  giveawayChannelID: "";
  roles: IGiveawayRoles[];
}

export interface IConfig {
  serverID: string;
  botID: string;
  devsIDs: string[];
  levelConfig: ILevelConfig;
  moderationConfig: IModerationConfig;
  giveawayConfig: IGiveawayConfig;
  gquestConfig: IGquestConfig;
  users: Types.ObjectId[] | IUser[];
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

export interface IGiveaway {
  serverID: string;
  hostID: string;
  messageID: string;
  channelID: string;
  endMessageID: string;

  prize: string;
  winnersCount: number;
  participants: string[]; //discord user ids
  winners: string[];
  imageUrl?: string;
  role_req?: string;
  role_color: string;
  starterMessage: string;

  // will use custom time stamps
  createdAt: number;
  updatedAt?: number;
  endsAt: number;
  isEnded: boolean;
  isPaused?: boolean;
}

export type LeaderboardUserTileInfo = {
  userID: string;
  level: number;
  rank: number;
  xp: number;
  currentRole: string;
};
