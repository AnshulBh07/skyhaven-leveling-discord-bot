import {
  ChannelType,
  ChatInputCommandInteraction,
  Client,
  PermissionResolvable,
} from "discord.js";

interface choices {
  name: string;
  value: string | number;
}

export interface IOptions {
  name: string;
  description: string;
  type: number;
  min_value?: number;
  max_value?: number;
  required?: boolean;
  channel_types?: ChannelType[];
  choices?: choices[];
}

export interface ICommandObj {
  name: string;
  description: string;
  options: IOptions[];
  type?: number;
  nsfw?: boolean;
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
}
