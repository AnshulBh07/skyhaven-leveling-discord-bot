import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { ICommandObj, ISubcommand } from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";

const init = async (): Promise<ICommandObj | ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "view",
        description: "View XP config for current server",
        type: ApplicationCommandOptionType.Subcommand,
        options: [],
      },

      callback: async (client, interaction) => {
        try {
          const guildId = interaction.guildId ?? "";
          const config = await Config.findOne({ serverID: guildId });

          const levelConfig = config?.levelConfig;

          if (!config || !levelConfig) {
            await interaction.editReply(
              "⚠️ No configuration found for this server"
            );
            return;
          }

          const embed = new EmbedBuilder()
            .setTitle("🔧 Server Configuration")
            .setColor("Blurple")
            .addFields(
              {
                name: "🪪 Server ID",
                value: config.serverID,
                inline: true,
              },
              {
                name: "🤖 Bot ID",
                value: config.botID || "Not set",
                inline: true,
              },
              {
                name: "📢 Notification Channel",
                value: levelConfig.notificationChannelID
                  ? `<#${levelConfig.notificationChannelID}>`
                  : "Not set",
                inline: true,
              },
              {
                name: "🚫 Blacklisted Channels",
                value: levelConfig.blacklistedChannels.length
                  ? levelConfig.blacklistedChannels
                      .map((id) => `<#${id}>`)
                      .join(", ")
                  : "None",
              },
              {
                name: "🙈 Ignored Channels",
                value: levelConfig.ignoredChannels.length
                  ? levelConfig.ignoredChannels
                      .map((id) => `<#${id}>`)
                      .join(", ")
                  : "None",
              },
              {
                name: "⏱ XP Cooldown",
                value: `${levelConfig.xpCooldown}ms`,
                inline: true,
              },
              {
                name: "📈 XP Sources",
                value:
                  [
                    levelConfig.xpFromText && "Text",
                    levelConfig.xpFromEmojis && "Emojis",
                    levelConfig.xpFromReactions && "Reactions",
                    levelConfig.xpFromAttachments && "Attachments",
                    levelConfig.xpFromEmbeds && "Embeds",
                    levelConfig.xpFromStickers && "Stickers",
                  ]
                    .filter(Boolean)
                    .join(", ") || "None",
              },
              {
                name: "🎖️ Level Roles",
                value: levelConfig.levelRoles.length
                  ? levelConfig.levelRoles
                      .map(
                        (role) =>
                          `• <@&${role.roleID}>: Lv. ${role.minLevel} - ${role.maxLevel}`
                      )
                      .join("\n")
                  : "None",
              }
            )
            .setFooter({
              text: "Use /lvl set to modify these settings.",
            });

          await interaction.editReply({ embeds: [embed] });
        } catch (err) {
          console.error(err);
        }
      },
    };
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

export default init;
