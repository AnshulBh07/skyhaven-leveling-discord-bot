import {
  ApplicationCommandSubCommandData,
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  Client,
  PermissionResolvable,
} from "discord.js";

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

export interface IConfig {
  serverID: string;
  botID: string;
  devsIDs: string[];
  blacklistedChannels: string[];
  ignoredChannels: string[];
  levelRoles: ILevelRoles[];
  notificationChannelID: string;
  xpCooldown: number;
  xpFromEmojis: boolean;
  xpFromReactions: boolean;
  xpFromText: boolean;
  xpFromAttachments: boolean;
  xpFromEmbeds: boolean;
  xpFromStickers: boolean;
  users:string[]; //stores object ids of users
}

export interface ISubcommand {
  data: ApplicationCommandSubCommandData;
  isSubCommand: boolean;

  callback: (
    client: Client,
    interaction: ChatInputCommandInteraction
  ) => Promise<void> | void;
}
