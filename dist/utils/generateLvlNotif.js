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
exports.generateLvlNotif = void 0;
const generateLevelUpCard_1 = require("../canvas/generateLevelUpCard");
const promoteUser_1 = require("./promoteUser");
const demoteUser_1 = require("./demoteUser");
const helperArrays_1 = require("../data/helperArrays");
const pendingUsers = new Set();
// this function will only generate notifs and cards if the level changes
const generateLvlNotif = (client, user, targetUser, prevLevel, finalLevel, lvlRolesArr, notifChannel, guildID) => __awaiter(void 0, void 0, void 0, function* () {
    // lock mutex logic to avoid slow gif load
    if (pendingUsers.has(targetUser.id))
        return;
    pendingUsers.add(targetUser.id);
    try {
        const fullUser = yield targetUser.fetch(true);
        const lvlCard = yield (0, generateLevelUpCard_1.generateLvlUpCard)(fullUser, prevLevel, finalLevel);
        if (prevLevel < finalLevel) {
            // user levels up
            const { isPromoted, promotionMessage } = yield (0, promoteUser_1.promoteUser)(client, user, lvlRolesArr, finalLevel, targetUser, guildID);
            if (notifChannel && notifChannel.isTextBased()) {
                // send level up message
                yield notifChannel.send({
                    content: `🎉 <@${targetUser.id}> leveled up! **Level ${prevLevel} ⟶ ${finalLevel}**`,
                    files: lvlCard ? [lvlCard] : [],
                });
                if (isPromoted) {
                    const idx = lvlRolesArr.findIndex((role) => role.minLevel <= finalLevel && role.maxLevel >= finalLevel);
                    const lastPromotionTime = user.leveling.lastPromotionTimestamp.getTime();
                    const currentTime = new Date().getTime();
                    const cooldown = 5000;
                    if (currentTime < lastPromotionTime + cooldown)
                        return;
                    user.leveling.lastPromotionTimestamp = new Date(currentTime);
                    yield notifChannel.send({
                        content: promotionMessage,
                        files: [
                            helperArrays_1.rolePromotionGifs[idx][Math.floor(Math.random() * helperArrays_1.rolePromotionGifs[idx].length)],
                        ],
                    });
                }
            }
        }
        else if (prevLevel > finalLevel) {
            // user loses a level
            const { isDemoted, demotionMessage } = yield (0, demoteUser_1.demoteUser)(client, user, lvlRolesArr, finalLevel, targetUser, guildID);
            if (notifChannel && notifChannel.isTextBased()) {
                yield notifChannel.send({
                    content: `<@${targetUser.id}> has leveled down. 😔 **Level ${prevLevel} ⟶ ${finalLevel}**`,
                    files: lvlCard ? [lvlCard] : [],
                });
                if (isDemoted) {
                    const lastPromotionTime = user.leveling.lastPromotionTimestamp.getTime();
                    const currentTime = new Date().getTime();
                    const cooldown = 5000;
                    if (currentTime < lastPromotionTime + cooldown)
                        return;
                    user.leveling.lastPromotionTimestamp = new Date(currentTime);
                    yield notifChannel.send({ content: demotionMessage });
                }
            }
        }
    }
    catch (err) {
        console.error(err);
    }
    finally {
        pendingUsers.delete(targetUser.id);
    }
});
exports.generateLvlNotif = generateLvlNotif;
