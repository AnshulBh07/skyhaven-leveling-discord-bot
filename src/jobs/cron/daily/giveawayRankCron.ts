// this cron job runs every single day and checks if user for a guild has met criteria
// for a rank up for giveaways
// this runs every single day at 7 AM in the morning
import { Client, GuildMember } from "discord.js";
import Config from "../../../models/configSchema";
import { IRaid, IUser } from "../../../utils/interfaces";
import { giveawayRoles } from "../../../data/helperArrays";
import GQuest from "../../../models/guildQuestsSchema";
import User from "../../../models/userSchema";
import cron from "node-cron";

const removeRole = async (member: GuildMember, roleID: string) => {
  try {
    if (member.roles.cache.has(roleID)) {
      await member.roles.remove(roleID);
    }
  } catch (err) {
    console.error("Error while removing role : ", err);
  }
};

// main function for logic
// for each user we will calculate the parameters needed
// Bronze Member - Yap level 10+
// Silver Member - Yap Level 15+, 2 raid, 2 gquests
// Gold Member - Yap level 20+, 3 raids, 3 gquests
// do this for all guilds
const runGiveawayRankJob = async (client: Client) => {
  try {
    const guilds = await Config.find().populate({ path: "users" });

    for (const g of guilds) {
      const members = g.users as unknown as IUser[];
      // fetch fresh guild object
      const guild = await client.guilds.fetch({
        guild: g.serverID,
        force: true,
      });

      if (!guild) {
        console.log("Guild not found.");
        continue;
      }

      const filterCheckArr = giveawayRoles.map((role) => role.name);
      // fetch roles from guild
      const roles = await guild.roles.fetch();
      const giveaway_related_roles = Array.from(roles.entries())
        .map(([_, role]) => role)
        .filter((role) => filterCheckArr.includes(role.name));

      const bronze_role = giveaway_related_roles.find(
        (role) => role.name === "Bronze Member"
      );
      const silver_role = giveaway_related_roles.find(
        (role) => role.name === "Silver Member"
      );
      const gold_role = giveaway_related_roles.find(
        (role) => role.name === "Gold Member"
      );

      if (!silver_role || !bronze_role || !gold_role) {
        console.log("Giveaway roles not found");
        continue;
      }

      // iterate over each user
      for (const m of members) {
        // fetch the guild member object for user which will be used to assign role
        const member = await guild.members.fetch({
          user: m.userID,
          force: true,
        });

        if (!member) continue;

        // remove all the related roles first
        await removeRole(member, bronze_role.id);
        await removeRole(member, silver_role.id);
        await removeRole(member, gold_role.id);

        // check for bronze rank first
        if (m.leveling.level >= 10) {
          await member.roles.add(bronze_role.id);
        }

        // calculate the number of gquests completed ever since the starting of cuurrent month
        const now = new Date();
        const startTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        ).getTime();

        // fetch guild quests and raids accordingly
        const completed_gquests = await GQuest.find({
          serverID: guild.id,
          userID: m.userID,
          status: "rewarded",
          rewardedAt: { $gte: startTime },
        });

        // to get the number of raids
        // we filter all completed raids of user
        const user = await User.findOne({
          userID: m.userID,
          serverID: guild.id,
        }).populate({ path: "raids.completed" });

        if (!user) continue;

        const completed_raids = (
          user.raids.completed as unknown as IRaid[]
        ).filter(
          (raid) =>
            raid.raidTimestamps.finishTime &&
            raid.raidTimestamps.finishTime > startTime
        );

        // add silver role
        if (
          m.leveling.level > 15 &&
          completed_gquests.length > 2 &&
          completed_raids.length > 2
        ) {
          await member.roles.add(silver_role.id);
        }

        // add gold role
        if (
          m.leveling.level > 20 &&
          completed_gquests.length > 2 &&
          completed_raids.length > 2
        ) {
          await member.roles.add(gold_role.id);
        }
      }
    }
  } catch (err) {
    console.error("Error while running giveaway rank job : ", err);
  }
};

export const scheduleGiveawayRankJob = async (client: Client) => {
  try {
    cron.schedule("0 1 * * *", async () => {
      console.log("🔁 Running giveaway rank cron job scheduled at 1 AM...");
      await runGiveawayRankJob(client);
    });
  } catch (err) {
    console.error("Error while scheduling giveaway rank job : ", err);
  }
};
