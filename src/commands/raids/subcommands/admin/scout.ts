import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
} from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Raid from "../../../../models/raidSchema";
import { leaderboardThumbnail } from "../../../../data/helperArrays";
import { isManager } from "../../../../utils/permissionsCheck";

const init = async (): Promise<ISubcommand | undefined> => {
  try {
    return {
      isSubCommand: true,
      data: {
        name: "scout",
        description: "Register buffs and debuffs for raid boss",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "raid_id",
            description:
              "ID of raid to be scouted (Check the announcement message or scout reminder message)",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },

      //   this command creates a thread at that channel and prompts admin to submit both images
      callback: async (client, interaction) => {
        try {
          const guild = interaction.guild;
          const channel = interaction.channel;
          const raid_id = interaction.options.getString("raid_id");

          if (
            !guild ||
            !channel ||
            channel.type !== ChannelType.GuildText ||
            !raid_id
          ) {
            await interaction.reply({
              content: "Invalid command.",
              flags: "Ephemeral",
            });
            return;
          }

          await interaction.deferReply({ flags: "Ephemeral" });

          //   create a thread and prompt user to send image
          const buffsThread = await channel.threads.create({
            name: "Buffs and Debuffs Submission",
            autoArchiveDuration: 60,
          });

          await buffsThread.send({
            content:
              "Please send images only for boss buffs followed by debuffs here.",
          });

          const rootCollector = buffsThread.createMessageCollector({
            filter: (msg) => !msg.author.bot,
            time: 0,
          });

          rootCollector.on("collect", async (msg) => {
            try {
              // check if the message author is valid
              const isAdmin = await isManager(
                client,
                msg.author.id,
                guild.id,
                "raid"
              );

              if (!isAdmin) {
                await buffsThread.send({
                  content:
                    "You do not have permission to interact in this thread.",
                });
                return;
              }

              if (msg.content.length > 0) {
                await buffsThread.send({
                  content: "Please include images only in your submission.",
                });
                return;
              }

              const attachments = Array.from(msg.attachments.entries()).map(
                ([_, attachment]) => attachment
              );

              //   check validity of submissions
              if (
                attachments.length !== 2 ||
                attachments.some(
                  (attachment) =>
                    attachment.contentType &&
                    !attachment.contentType.startsWith("image/")
                )
              ) {
                await buffsThread.send({
                  content: "Invalid submission. Please try again.",
                });
                return;
              }

              // everything valid, update db
              const updatedRaid = await Raid.findOneAndUpdate(
                { announcementMessageID: raid_id, serverID: guild.id },
                {
                  $set: {
                    bossBuffsImageUrl: attachments[0].url,
                    bossDebuffsImageUrl: attachments[1].url,
                    stage: "scouted",
                    "raidTimestamps.scoutTime": Date.now(),
                  },
                },
                { new: true }
              );

              if (!updatedRaid) return;

              // send an embed at channel and delete the thread
              await buffsThread.send({
                content:
                  "Thanks for your submission. Please wait while we process it.",
              });

              const buffs = new AttachmentBuilder(
                updatedRaid.bossBuffsImageUrl
              ).setName("buffs.png");
              const debuffs = new AttachmentBuilder(
                updatedRaid.bossDebuffsImageUrl
              ).setName("debuffs.png");

              const thumbnail = new AttachmentBuilder(
                leaderboardThumbnail
              ).setName("thumbnail.png");

              const scoutEmbed = new EmbedBuilder()
                .setTitle("🕵️‍♀️ Scout Intel: Buffs & Debuffs")
                .setDescription(
                  `Our scouts have risked their lives to bring you this crucial intel. Read carefully. Or don't. But don’t blame us when ${updatedRaid.bosses[0]
                    .split("_")
                    .map((boss) => boss.at(0)?.toUpperCase() + boss.slice(1))
                    .join(" ")} slaps you.`
                )
                .setColor("Orange")
                .setThumbnail("attachment://thumbnail.png")
                .setFooter({
                  text: "If you die, it's probably your fault. Scouts out. Meet you guys at raid.",
                })
                .setTimestamp();

              const scoutMsg = await channel.send({
                embeds: [scoutEmbed],
                files: [thumbnail],
              });
              await channel.send({ files: [buffs] });
              await channel.send({ files: [debuffs] });

              updatedRaid.scoutMessageID = scoutMsg.id;
              await updatedRaid.save();

              // add a link button on annoucnement message
              const announceMsg = await channel.messages.fetch(
                updatedRaid.announcementMessageID
              );

              const prevComponents = announceMsg.components;

              const messageLink = `https://discord.com/channels/${guild.id}/${channel.id}/${scoutMsg.id}`;

              const LinkButton =
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                  new ButtonBuilder()
                    .setLabel("Jump to Buffs and Debuffs")
                    .setStyle(ButtonStyle.Link)
                    .setURL(messageLink)
                );

              await announceMsg.edit({
                components: [...prevComponents, LinkButton],
              });

              await buffsThread.delete("Buffs registered");
            } catch (err) {
              console.error("Error in root buff submission collector : ", err);
            }
          });

          await interaction.editReply({
            content: "Raid buffs and debuffs registeration process started.",
          });
        } catch (err) {
          console.error("Error in raid scout subcommand callback : ", err);
        }
      },
    };
  } catch (err) {
    console.error("Error in raid scout subcommand : ", err);
    return undefined;
  }
};

export default init;
