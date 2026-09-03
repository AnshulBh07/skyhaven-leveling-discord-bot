"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLvlFromXP = void 0;
const getNextLevelXP_1 = require("./getNextLevelXP");
const getLvlFromXP = (totalXP) => {
    let level = 1;
    let currXp = 0;
    while (true) {
        const xpForNextLevel = (0, getNextLevelXP_1.getNextLvlXP)(level);
        if (currXp + xpForNextLevel > totalXP)
            break;
        currXp += xpForNextLevel;
        level++;
    }
    return level;
};
exports.getLvlFromXP = getLvlFromXP;
