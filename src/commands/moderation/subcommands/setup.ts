import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { IConfig, ISubcommand } from "../../../utils/interfaces";
import Config from "../../../models/configSchema";
import { guildConfigCheck } from "../../../utils/configurationCheck";
import { getThumbnail } from "../../../utils/commonUtils";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "setup",
        description:
          "Check and guide through the full server configuration setup.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [],
      },

      callback: async (client, interaction) => {
        try {
          const guild = interaction.guild;

          if (!guild) {
            await interaction.editReply({
              content:
                "⚠️ Invalid command. Please check your input and try again.",
            });
            return;
          }

          const config = await Config.findOne({ serverID: guild.id });

          if (!config) {
            await interaction.editReply(
              "🔍 This server could not be identified. Check if the bot has access."
            );
            return;
          }

          const isReady = guildConfigCheck(config as unknown as IConfig);

          const missing: Record<string, string[]> = {
            Leveling: [],
            Moderation: [],
            Giveaway: [],
            Guild_Quest: [],
            Guild_Maze: [],
            Raids: [],
          };

          // Leveling Config
          if (!config.levelConfig.notificationChannelID)
            missing.Leveling.push("`/lvl channel`");
          if (!config.levelConfig.managerRoles.length)
            missing.Leveling.push("`/lvl add-admin`");

          // Moderation Config
          if (!config.moderationConfig.welcomeChannelID)
            missing.Moderation.push("`/mod welcome-channel`");
          if (!config.moderationConfig.farewellChannelID)
            missing.Moderation.push("`/mod farewell-channel`");
          if (!config.moderationConfig.botAdminIDs.length)
            missing.Moderation.push("`/mod add-admin`");

          // Giveaway Config
          if (!config.giveawayConfig.giveawayChannelID)
            missing.Giveaway.push("`/ga channel`");
          if (!config.giveawayConfig.giveawayRole)
            missing.Giveaway.push("`/ga use-role`");
          if (!config.giveawayConfig.managerRoles.length)
            missing.Giveaway.push("`/ga add-admin`");

          // GQuest / Maze Config
          if (!config.gquestMazeConfig.gquestChannelID)
            missing.Guild_Quest.push("`/gq channel`");
          if (!config.gquestMazeConfig.gquestRole)
            missing.Guild_Quest.push("`/gq use-role`");
          if (!config.gquestMazeConfig.gquestRewardAmount)
            missing.Guild_Quest.push("`/gq reward-amount`");
          if (!config.gquestMazeConfig.managerRoles.length)
            missing.Guild_Quest.push("`/gq add-admin`");

          if (!config.gquestMazeConfig.mazeChannelID)
            missing.Guild_Maze.push("`/mz channel`");
          if (!config.gquestMazeConfig.mazeRole)
            missing.Guild_Maze.push("`/mz use-role`");
          if (!config.gquestMazeConfig.mazeRewardAmount)
            missing.Guild_Maze.push("`/mz reward-amount`");

          // Raid Config
          if (!config.raidConfig.raidChannelID)
            missing.Raids.push("`/raid channel`");
          if (!config.raidConfig.raidRole)
            missing.Raids.push("`/raid use-role`");
          if (!config.raidConfig.managerRoles.length)
            missing.Raids.push("`/raid add-admin`");
          if (!config.raidConfig.tankEmojiID)
            missing.Raids.push("`/raid tank_emoji`");
          if (!config.raidConfig.dpsEmojiID)
            missing.Raids.push("`/raid dps_emoji`");
          if (!config.raidConfig.supportEmojiID)
            missing.Raids.push("`/raid support_emoji`");

          const thumbnail = getThumbnail();

          // --- Embed Construction ---
          const embed = new EmbedBuilder()
            .setTitle("🛠️ Server Setup Checklist")
            .setColor(isReady ? "Green" : "Orange")
            .setDescription(
              isReady
                ? "✅ All essential systems are configured.\nYou can still review settings if needed."
                : "⚠️ The following required settings are missing. Run the listed commands to complete setup:"
            )
            .setFooter({
              text: `${guild.name} Configuration`,
              iconURL: "attachment://thumbnail.png",
            })
            .setTimestamp();

          for (const [section, commands] of Object.entries(missing)) {
            if (commands.length > 0) {
              embed.addFields({
                name: `__${section.split("_").join(" ")}__`,
                value: commands.join("\n"),
                inline: false,
              });
            }
          }

          await interaction.editReply({ embeds: [embed], files: [thumbnail] });
        } catch (err) {
          console.error("Error in mod setup subcommand callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in mod setup subcommand : ", err);
    return undefined;
  }
};

export default init;
