import { IConfig } from "./interfaces";

export const guildConfigCheck = (guildConfig: IConfig) => {
  const { levelConfig, giveawayConfig } = guildConfig;

  return (
    levelConfig.notificationChannelID.length > 0 &&
    giveawayConfig.giveawayChannelID.length > 0
  );
};
