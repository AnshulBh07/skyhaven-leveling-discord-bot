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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRankCard = void 0;
const helperArrays_1 = require("../data/helperArrays");
const discord_arts_1 = require("discord-arts");
const generateRankCard = (user, guild, rankData) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // get official badges from discord
        const userBadges = (_a = user.flags) === null || _a === void 0 ? void 0 : _a.toArray();
        if (!userBadges)
            return undefined;
        const allBadges = [];
        for (const badge of userBadges) {
            if (helperArrays_1.discordBadges.has(badge))
                allBadges.push(helperArrays_1.discordBadges.get(badge));
        }
        // check if user has nitro by checking if they have a banner or not
        const fullUserInfo = yield user.fetch(true);
        if (fullUserInfo.banner && fullUserInfo.banner.length > 0) {
            allBadges.push(helperArrays_1.discordBadges.get("Nitro"));
        }
        // check if the user is a server booster
        const guild_member = yield guild.members.fetch(user.id);
        const allRoles = guild_member.roles.cache.map((role) => role.name);
        if (allRoles.includes("Server Booster"))
            allBadges.push(helperArrays_1.discordBadges.get("ServerBooster"));
        const presenceStatus = (_b = guild_member.presence) === null || _b === void 0 ? void 0 : _b.status;
        const rankCard = yield (0, discord_arts_1.Profile)(user.id, {
            overwriteBadges: true,
            customBadges: allBadges,
            presenceStatus: presenceStatus !== null && presenceStatus !== void 0 ? presenceStatus : "offline",
            badgesFrame: true,
            customDate: new Date(),
            moreBackgroundBlur: true,
            backgroundBrightness: 100,
            removeAvatarFrame: false,
            rankData: {
                currentXp: rankData.currentXp,
                requiredXp: rankData.requiredXp,
                rank: rankData.rank,
                level: rankData.level,
                barColor: helperArrays_1.xpBarColors[Math.floor(Math.random() * helperArrays_1.xpBarColors.length)],
                levelColor: "#ada8c6",
                autoColorRank: true,
            },
        });
        return rankCard;
    }
    catch (err) {
        console.error(err);
        return undefined;
    }
});
exports.generateRankCard = generateRankCard;
