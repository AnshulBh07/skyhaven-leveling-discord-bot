"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCumulativeXPUptoLvl = void 0;
const getNextLevelXP_1 = require("./getNextLevelXP");
const getCumulativeXPUptoLvl = (level) => {
    let xp = 0;
    while (--level) {
        xp += (0, getNextLevelXP_1.getNextLvlXP)(level);
    }
    return xp;
};
exports.getCumulativeXPUptoLvl = getCumulativeXPUptoLvl;
