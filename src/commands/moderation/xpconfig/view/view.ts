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

          if (!config) {
            interaction.editReply("⚠️ No configuration found for this server");
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
                name: "🛡️ Developers",
                value:
                  config.devsIDs.length > 0
                    ? config.devsIDs.map((id) => `<@${id}>`).join(", ")
                    : "None",
              },
              {
                name: "📢 Notification Channel",
                value: config.notificationChannelID
                  ? `<#${config.notificationChannelID}>`
                  : "Not set",
                inline: true,
              },
              {
                name: "🚫 Blacklisted Channels",
                value: config.blacklistedChannels.length
                  ? config.blacklistedChannels
                      .map((id) => `<#${id}>`)
                      .join(", ")
                  : "None",
              },
              {
                name: "🙈 Ignored Channels",
                value: config.ignoredChannels.length
                  ? config.ignoredChannels.map((id) => `<#${id}>`).join(", ")
                  : "None",
              },
              {
                name: "⏱ XP Cooldown",
                value: `${config.xpCooldown}ms`,
                inline: true,
              },
              {
                name: "📈 XP Sources",
                value:
                  [
                    config.xpFromText && "Text",
                    config.xpFromEmojis && "Emojis",
                    config.xpFromReactions && "Reactions",
                    config.xpFromAttachments && "Attachments",
                    config.xpFromEmbeds && "Embeds",
                    config.xpFromStickers && "Stickers",
                  ]
                    .filter(Boolean)
                    .join(", ") || "None",
              },
              {
                name: "🎖️ Level Roles",
                value: config.levelRoles.length
                  ? config.levelRoles
                      .map(
                        (role) =>
                          `• <@&${role.roleID}>: Lv. ${role.minLevel} - ${role.maxLevel}`
                      )
                      .join("\n")
                  : "None",
              }
            )
            .setFooter({
              text: "Use /config set to modify these settings.",
            });

          interaction.editReply({ embeds: [embed] });
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
