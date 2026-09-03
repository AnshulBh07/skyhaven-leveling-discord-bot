"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleGiveawayRankJob = void 0;
const configSchema_1 = __importDefault(require("../../../models/configSchema"));
const helperArrays_1 = require("../../../data/helperArrays");
const guildQuestsSchema_1 = __importDefault(require("../../../models/guildQuestsSchema"));
const userSchema_1 = __importDefault(require("../../../models/userSchema"));
const node_cron_1 = __importDefault(require("node-cron"));
const removeRole = (member, roleID) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (member.roles.cache.has(roleID)) {
            yield member.roles.remove(roleID);
        }
    }
    catch (err) {
        console.error("Error while removing role : ", err);
    }
});
// main function for logic
// for each user we will calculate the parameters needed
// Bronze Member - Yap level 10+
// Silver Member - Yap Level 15+, 2 raid, 2 gquests
// Gold Member - Yap level 20+, 3 raids, 3 gquests
// do this for all guilds
const runGiveawayRankJob = (client) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const guilds = yield configSchema_1.default.find().populate({ path: "users" });
        for (const g of guilds) {
            const members = g.users;
            // fetch fresh guild object
            let guild = null;
            try {
                guild = yield client.guilds.fetch({
                    guild: g.serverID,
                    force: true,
                });
            }
            catch (err) {
                if (err.code === 10004) {
                    console.warn(`Uknown guild. Skipping this guild.`);
                    continue;
                }
                else {
                    throw err;
                }
            }
            if (!guild)
                continue;
            const filterCheckArr = helperArrays_1.giveawayRoles.map((role) => role.name);
            // fetch roles from guild
            const roles = yield guild.roles.fetch();
            const giveaway_related_roles = Array.from(roles.entries())
                .map(([_, role]) => role)
                .filter((role) => filterCheckArr.includes(role.name));
            const bronze_role = giveaway_related_roles.find((role) => role.name === "Bronze Member");
            const silver_role = giveaway_related_roles.find((role) => role.name === "Silver Member");
            const gold_role = giveaway_related_roles.find((role) => role.name === "Gold Member");
            if (!silver_role || !bronze_role || !gold_role) {
                console.log("Giveaway roles not found");
                continue;
            }
            // iterate over each user
            for (const m of members) {
                // fetch the guild member object for user which will be used to assign role
                const member = yield guild.members.fetch({
                    user: m.userID,
                    force: true,
                });
                if (!member)
                    continue;
                // remove all the related roles first
                yield removeRole(member, bronze_role.id);
                yield removeRole(member, silver_role.id);
                yield removeRole(member, gold_role.id);
                // check for bronze rank first
                if (m.leveling.level >= 10) {
                    yield member.roles.add(bronze_role.id);
                }
                // calculate the number of gquests completed ever since the starting of cuurrent month
                const now = new Date();
                const startTime = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
                // fetch guild quests and raids accordingly
                const completed_gquests = yield guildQuestsSchema_1.default.find({
                    serverID: guild.id,
                    userID: m.userID,
                    status: "rewarded",
                    rewardedAt: { $gte: startTime },
                });
                // to get the number of raids
                // we filter all completed raids of user
                const user = yield userSchema_1.default.findOne({
                    userID: m.userID,
                    serverID: guild.id,
                }).populate({ path: "raids.completed" });
                if (!user)
                    continue;
                const completed_raids = user.raids.completed.filter((raid) => raid.raidTimestamps.finishTime &&
                    raid.raidTimestamps.finishTime > startTime);
                // add silver role
                if (m.leveling.level > 15 &&
                    completed_gquests.length > 2 &&
                    completed_raids.length > 2) {
                    yield member.roles.add(silver_role.id);
                }
                // add gold role
                if (m.leveling.level > 20 &&
                    completed_gquests.length > 3 &&
                    completed_raids.length > 3) {
                    yield member.roles.add(gold_role.id);
                }
            }
        }
    }
    catch (err) {
        console.error("Error while running giveaway rank job : ", err);
    }
});
const scheduleGiveawayRankJob = (client) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        node_cron_1.default.schedule("0 1 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
            console.log("🔁 Running giveaway rank cron job scheduled at 1 AM...");
            yield runGiveawayRankJob(client);
        }));
    }
    catch (err) {
        console.error("Error while scheduling giveaway rank job : ", err);
    }
});
exports.scheduleGiveawayRankJob = scheduleGiveawayRankJob;
