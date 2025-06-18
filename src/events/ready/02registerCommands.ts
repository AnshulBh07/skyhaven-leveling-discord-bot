import { Client } from "discord.js";
import getLocalCommands from "../../utils/getLocalCommands";
import getApplicationCommands from "../../utils/getApplicationCommands";
import { areCommandsSame } from "../../utils/areCommandsSame";

const TEST_GUILD_NAME = "Test Server"; // replace with your dev server name

const registerCommands = async (client: Client) => {
  try {
    const localCommands = await getLocalCommands();
    const isDev = process.env.NODE_ENV !== "production";

    if (isDev) {
      // 🔁 Register for dev guild instantly
      const devGuild = client.guilds.cache.find(
        (guild) => guild.name === TEST_GUILD_NAME
      );
      if (!devGuild) {
        console.error("⚠️ Dev guild not found.");
        return;
      }

      const guildCommands = await getApplicationCommands(client, devGuild.id);
      const manager = devGuild.commands;

      if (!guildCommands) {
        console.log("No guild commands found while registering.");
        return;
      }

      for (const localCommand of localCommands) {
        const { isDeleted, callback, ...command } = localCommand;
        const existing = guildCommands.find((c) => c.name === command.name);

        if (isDeleted) {
          if (existing) {
            await manager.delete(existing.id);
            console.log(`🗑️ Deleted command ${command.name} (guild)`);
          }
          continue;
        }

        if (!existing) {
          await manager.create(command);
          console.log(`✅ Created command ${command.name} (guild)`);
        } else if (!areCommandsSame(localCommand, existing)) {
          await manager.edit(existing.id, command);
          console.log(`🔄 Updated command ${command.name} (guild)`);
        }
      }
    } else {
      // 🌍 Register globally (may take up to 1 hour)
      const globalCommands = await getApplicationCommands(client);
      const manager = client.application?.commands;

      if (!globalCommands) {
        console.log("No global commands found while registering");
        return;
      }

      if (!manager) {
        console.error("❌ Could not access application.commands");
        return;
      }

      for (const localCommand of localCommands) {
        const { isDeleted, callback, ...command } = localCommand;
        const existing = globalCommands.find((c) => c.name === command.name);

        if (isDeleted) {
          if (existing) {
            await manager.delete(existing.id);
            console.log(`🗑️ Deleted command ${command.name} (global)`);
          }
          continue;
        }

        if (!existing) {
          await manager.create(command);
          console.log(`🌐 Created command ${command.name} (global)`);
        } else if (!areCommandsSame(localCommand, existing)) {
          await manager.edit(existing.id, command);
          console.log(`🌐 Updated command ${command.name} (global)`);
        }
      }
    }
  } catch (err) {
    console.error("Error registering commands:", err);
  }
};

export default registerCommands;
