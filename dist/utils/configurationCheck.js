"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guildConfigCheck = void 0;
const guildConfigCheck = (guildConfig) => {
    const { levelConfig, giveawayConfig, gquestMazeConfig, raidConfig, moderationConfig, } = guildConfig;
    // return (
    // 	levelConfig.notificationChannelID.length > 0 &&
    // 	levelConfig.managerRoles.length > 0 &&
    // 	moderationConfig.welcomeChannelID.length > 0 &&
    // 	moderationConfig.farewellChannelID.length > 0 &&
    // 	moderationConfig.botAdminIDs.length > 0 &&
    // 	giveawayConfig.giveawayChannelID.length > 0 &&
    // 	giveawayConfig.giveawayRole.length > 0 &&
    // 	giveawayConfig.managerRoles.length > 0 &&
    // 	gquestMazeConfig.gquestChannelID.length > 0 &&
    // 	gquestMazeConfig.mazeChannelID.length > 0 &&
    // 	gquestMazeConfig.gquestRole.length > 0 &&
    // 	gquestMazeConfig.mazeRole.length > 0 &&
    // 	gquestMazeConfig.gquestRewardAmount > 0 &&
    // 	gquestMazeConfig.mazeRewardAmount > 0 &&
    // 	raidConfig.raidChannelID.length > 0 &&
    // 	raidConfig.raidRole.length > 0 &&
    // 	raidConfig.managerRoles.length > 0 &&
    // 	raidConfig.dpsEmojiID.length > 0 &&
    // 	raidConfig.tankEmojiID.length > 0 &&
    // 	raidConfig.supportEmojiID.length > 0
    // );
    return true;
};
exports.guildConfigCheck = guildConfigCheck;
