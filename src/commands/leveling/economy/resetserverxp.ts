import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  PermissionFlagsBits,
} from "discord.js";
import { ICommandObj, ILevelRoles } from "../../../utils/interfaces";
import Config from "../../../models/configSchema";
import User from "../../../models/userSchema";

const init = async (): Promise<ICommandObj | undefined> => {
  try {
    return {
      name: "resetserverxp",
      description: "Reset XP and levels for all users in the server",
      options: [],
      permissionsRequired: [
        PermissionFlagsBits.ManageRoles,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.Administrator,
      ],

      callback: async (client, interaction) => {
        try {
          const guildID = interaction.guildId;
          const guildConfig = await Config.findOne({ serverID: guildID });

          if (!guildID || !guildConfig) {
            await interaction.editReply("Invalid guild.");
            return;
          }

          // IMPORTANT - confirmation prompt
          const buttonsRow =
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setCustomId("confirm")
                .setLabel("✅ Confirm")
                .setStyle(ButtonStyle.Danger),
              new ButtonBuilder()
                .setCustomId("cancel")
                .setLabel("❌ Cancel")
                .setStyle(ButtonStyle.Secondary)
            );

          await interaction.reply({
            content:
              "**⚠️ This will reset XP and level data for _all users_ in this server.**\nAre you sure you want to proceed?",
            components: [buttonsRow],
          });

          // always attach collector to reply for that particular message only or the collector will listen to all the inetractions on that channel causing malfunction
          const reply = await interaction.fetchReply();

          const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 30_000,
            filter: (btnInt) => btnInt.user.id === interaction.user.id,
          });

          // collect user input from buttons
          collector?.on("collect", async (btnInt) => {
            if (btnInt.customId === "cancel") {
              await btnInt.update({
                content: "Reset Cancelled",
                components: [],
              });
              collector.stop(); //fire the on end event
              return;
            }

            if (btnInt.customId === "confirm") {
              await btnInt.update({
                content: "Resetting all XP and levels...",
                components: [],
              });

              const { levelRoles, notificationChannelID } =
                guildConfig.levelConfig;
              const allRelatedRoles = levelRoles.map((role) => role.roleID);
              const basicRoleId = allRelatedRoles[0];

              const users = await User.find({ serverID: guildID });

              for (const user of users) {
                const guild_member = interaction.guild?.members.cache.find(
                  (member) => member.id === user.userID
                );

                if (!guild_member) continue;

                const memberRoles = guild_member.roles.cache.map(
                  (role) => role.id
                );

                // remove all related roles from all users
                for (const role of allRelatedRoles) {
                  if (memberRoles.includes(role))
                    await guild_member.roles.remove(role);
                }

                // add basicrole
                await guild_member.roles.add(basicRoleId);
              }

              await User.updateMany(
                { serverID: guildID },
                {
                  $set: {
                    "leveling.xp": 0,
                    "leveling.totalXp": 0,
                    "leveling.level": 1,
                    "leveling.currentRole": basicRoleId,
                    "leveling.lastPromotionTimestamp": new Date(),
                    "leveling.voiceXp": 0,
                    "leveling.textXp": 0,
                    "leveling.xpPerDay": new Map<string, number>(),
                  },
                }
              );

              const notifChannel = interaction.guild?.channels.cache.find(
                (channel) => channel.id === notificationChannelID
              );

              if (notifChannel && notifChannel.isTextBased()) {
                await notifChannel.send({
                  content: `🧨 **Server XP Reset Notice**\nAll users' XP and levels have been **reset** by an administrator.\nEveryone has been returned to **Level 1** and their default roles.\n\n🔁 Let the grind begin again!\nEarn XP through chatting and participating to level up and unlock new roles.`,
                });
              }

              await interaction.editReply(
                "XP and level has been reset for all users in the server."
              );

              collector.stop();
            }
          });

          // collected contains a map/collection of all the interactions untill event ends
          collector?.on("end", async (collected, reason) => {
            if (reason === "time" && !collected.size) {
              await interaction.editReply({
                content: "⏱️ Confirmation timed out. Reset was not performed.",
                components: [],
              });
            }
          });
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
