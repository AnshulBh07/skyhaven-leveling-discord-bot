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
    interaction: ChatInputCommandInteraction,
    mood?: moodType
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
  managerRoles: string[];
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
  gquestCount: number;
  imageUrl: string;
  imageHash: string;
  status: GquestStatus;
  submittedAt?: number;
  rewardedAt?: number;
  rejectedAt?: number;
  reviewedBy: string; //admin disocrd id
  rejectionReason?: string; //if rejected
  rewardMessageID?: string;
  proofImageUrl?: string;
  lastRewardBtnClickAt?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMaze {
  serverID: string;
  userID: string;
  messageID: string; //serves as gquest id
  channelID: string;
  submissionThreadID: string;
  embedMessageID: string;
  imageUrls: string[];
  startFloor: number;
  endFloor: number;
  imageHash: string;
  status: GquestStatus;
  submittedAt?: number;
  rewardedAt?: number;
  rejectedAt?: number;
  reviewedBy: string; //admin disocrd id
  rejectionReason?: string; //if rejected
  rewardMessageID?: string;
  proofImageUrl?: string;
  lastRewardBtnClickAt?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IUserGquests {
  dmNotif: boolean;
  pending: Types.ObjectId[];
  rewarded: Types.ObjectId[];
  rejected: Types.ObjectId[];
  lastSubmissionDate: Date | null;
  lastRewardDate: Date | null;
  lastRejectionDate: Date | null;
  totalRewarded: number;
}

interface IUserMaze {
  dmNotif: boolean;
  pending: Types.ObjectId[];
  rewarded: Types.ObjectId[];
  rejected: Types.ObjectId[];
  lastSubmissionDate: Date | null;
  lastRewardDate: Date | null;
  lastRejectionDate: Date | null;
  totalRewarded: number;
}

interface IGquestConfig {
  mazeChannelID: string;
  gquestChannelID: string;
  gquestRole: string;
  mazeRole: string;
  managerRoles: string[];
  gquestRewardAmount: number;
  mazeRewardAmount: number;
}

interface IUserRaid {
  dmNotif: boolean;
  completed: Types.ObjectId[] | string[];
  noShows: Types.ObjectId[] | string[];
  reliability: number;
}

export interface IUser {
  userID: string;
  serverID: string;
  username: string;
  nickname: string;
  leveling: ILeveling;
  giveaways: IUserGiveaways;
  gquests: IUserGquests;
  mazes: IUserMaze;
  raids: IUserRaid;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRaid {
  serverID: string;
  channelID: string;
  announcementMessageID: string;
  scoutMessageID: string;
  teamAllotmentMessageID: string;
  bosses: ("roaring_thruma" | "dark_skull" | "bison" | "chimera" | "celdyte")[];
  bannerUrl: string;
  participants: {
    tank: string[];
    dps: string[];
    support: string[];
  };
  waitlist: {
    tank: string[];
    dps: string[];
    support: string[];
  };
  bossBuffsImageUrl: string;
  bossDebuffsImageUrl: string;
  stage:
    | "announced"
    | "scout_reminded"
    | "scouted"
    | "alloted"
    | "player_reminded"
    | "finished"
    | "reviewed"
    | "completed";
  raidTimestamps: {
    announcementTime: number;
    startTime: number;
    scoutTime?: number;
    allotmentTime?: number;
    finishTime?: number;
    reviewTime?: number;
    completedTime?: number;
  };
}

interface IRaidConfig {
  raidChannelID: string;
  raidRole: string;
  raidDay: number;
  raidTime: string;
  managerRoles: string[];
  banList: string[];
  tankEmojiID: string;
  dpsEmojiID: string;
  supportEmojiID: string;
}

interface IModerationConfig {
  welcomeMessage: string;
  welcomeChannelID: string;
  farewellMessage: string;
  farewellChannelID: string;
  serverBoostChannelID: string;
  botAdminIDs: string[];
}

type UserBan = {
  userID: string;
  reason?: string;
  banDate: Date;
  banBy: string;
};

interface IGiveawayConfig {
  giveawayChannelID: "";
  roles: IGiveawayRoles[];
  giveawayRole: string;
  managerRoles: string[];
  banList: UserBan[];
}

export type moodType =
  | "serene"
  | "tsundere"
  | "tired"
  | "divinePride"
  | "cheerful"
  | "cold"
  | "dreamy"
  | "gentle"
  | "gloomy"
  | "manic"
  | "melancholy"
  | "mischievous"
  | "playful"
  | "righteous"
  | "flirtatious"
  | "watchful"
  | "merciful"
  | "divine"
  | "prophetic";

interface IMoodConfig {
  seraphinaMood: moodType;
}

export interface IConfig {
  serverID: string;
  botID: string;
  devsIDs?: string[];
  levelConfig: ILevelConfig;
  moderationConfig: IModerationConfig;
  giveawayConfig: IGiveawayConfig;
  gquestMazeConfig: IGquestConfig;
  raidConfig: IRaidConfig;
  moodConfig: IMoodConfig;
  users: Types.ObjectId[] | IUser[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISubcommand {
  data: ApplicationCommandSubCommandData;
  isSubCommand: boolean;

  callback: (
    client: Client,
    interaction: ChatInputCommandInteraction,
    mood?: moodType
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

export type questMazeLeaderboardUser = {
  userID: string;
  rank: number;
  completed: number;
  contribution_score: number;
};

export type LLMCommandContext =
  | "invalid_command"
  | "server_config_not_found"
  | "giveaway_role_not_created"
  | "user_already_has_giveaway_role"
  | "user_assign_giveaway_role_success"
  | "user_already_banned_from_giveaways"
  | "user_banned_from_giveaways_success"
  | "user_not_found_in_records"
  | "interaction_timedout"
  | "revoked_role_from_user"
  | "user_unbanned_from_giveaways"
  | "set_giveaway_role"
  | "add_giveaway_management_role"
  | "set_giveaway_channel"
  | "remove_giveaway_management_role"
  | "delete_giveaway"
  | "find_giveaway_message"
  | "list_giveaways"
  | "reroll_giveaway"
  | "create_giveaway"
  | "giveaways_won_list"
  | "set_guild_quest_reward_amount"
  | "set_guild_quest_role"
  | "add_guild_quest_management_role"
  | "remove_guild_quest_management_role"
  | "generate_guild_quest_leaderboard"
  | "get_pending_guild_quest_list"
  | "get_rejected_guild_quest_list"
  | "get_rewarded_guild_quest_list"
  | "generate_player_stats"
  | "processing_submission"
  | "generate_rank_card"
  | "generate_yapping_leaderboard"
  | "set_guild_maze_reward_amount"
  | "set_guild_maze_role"
  | "add_guild_maze_management_role"
  | "remove_guild_maze_management_role"
  | "generate_guild_maze_leaderboard"
  | "get_pending_guild_maze_list"
  | "get_rejected_guild_maze_list"
  | "get_rewarded_guild_maze_list"
  | "no_permission";

export const inputMap: Record<LLMCommandContext, string> = {
  invalid_command: "A user entered a command that doesn't exist.",
  server_config_not_found: "The server has not configured its settings yet.",
  giveaway_role_not_created:
    "The giveaway role is missing and needs to be created.",
  user_already_has_giveaway_role: "The user already has the giveaway role.",
  user_assign_giveaway_role_success:
    "The user was just given the giveaway role successfully.",
  user_already_banned_from_giveaways:
    "The user is already banned from joining giveaways.",
  user_banned_from_giveaways_success:
    "The user has been successfully banned from participating in giveaways.",
  user_not_found_in_records: "The user doesn't exist in our records.",
  interaction_timedout:
    "The user didn't respond in time and the interaction has timed out.",
  revoked_role_from_user: "A role was removed from the user.",
  user_unbanned_from_giveaways: "The user is now unbanned from giveaways.",
  set_giveaway_role: "A new giveaway role was set for the server.",
  add_giveaway_management_role: "A role was added to help manage giveaways.",
  set_giveaway_channel: "A channel was designated for giveaways.",
  remove_giveaway_management_role: "A giveaway management role was removed.",
  delete_giveaway: "A giveaway has been deleted from the server.",
  find_giveaway_message: "The bot tried to find a giveaway message.",
  list_giveaways: "A user requested the list of active giveaways.",
  reroll_giveaway: "The bot rerolled a giveaway to pick a new winner.",
  create_giveaway: "A new giveaway was just created.",
  giveaways_won_list: "A user asked to see which giveaways they've won.",
  set_guild_quest_reward_amount:
    "A new reward amount was set for guild quests.",
  set_guild_quest_role: "A role was assigned for guild quest eligibility.",
  add_guild_quest_management_role: "A role was added to manage guild quests.",
  remove_guild_quest_management_role:
    "A role was removed from managing guild quests.",
  generate_guild_quest_leaderboard:
    "The guild quest leaderboard is being generated.",
  get_pending_guild_quest_list: "The bot is listing all pending guild quests.",
  get_rejected_guild_quest_list:
    "The bot is listing all rejected guild quests.",
  get_rewarded_guild_quest_list:
    "The bot is listing all rewarded guild quests.",
  generate_player_stats:
    "A user requested their personal stats or contribution history.",
  processing_submission:
    "The bot is currently processing a submission from a user.",
  generate_rank_card: "The bot is generating a rank card for a user.",
  generate_yapping_leaderboard:
    "The bot is generating a leaderboard based on message activity.",
  set_guild_maze_reward_amount:
    "A reward amount was set for guild maze participation.",
  set_guild_maze_role: "A role was assigned for maze eligibility or reward.",
  add_guild_maze_management_role:
    "A role was added to manage guild maze activities.",
  remove_guild_maze_management_role:
    "A role was removed from managing guild maze activities.",
  generate_guild_maze_leaderboard:
    "The bot is generating the guild maze leaderboard.",
  get_pending_guild_maze_list:
    "The bot is listing all pending maze submissions.",
  get_rejected_guild_maze_list:
    "The bot is listing all rejected maze submissions.",
  get_rewarded_guild_maze_list:
    "The bot is listing all maze entries that received rewards.",
  no_permission:
    "The user tried to use a command they don't have permission for.",
};
