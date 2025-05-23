import {
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
  choices?: choices[];
}

export interface ICommandObj {
  name: string;
  description: string;
  options?: IOptions[];
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
