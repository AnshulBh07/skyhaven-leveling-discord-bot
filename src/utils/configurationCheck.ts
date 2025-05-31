import { IConfig } from "./interfaces";

export const guildConfigCheck = (guildConfig: IConfig) => {
  const { levelConfig } = guildConfig;

  return levelConfig.notificationChannelID.length > 0;
};
