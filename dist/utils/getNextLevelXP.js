"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextLvlXP = void 0;
const getNextLvlXP = (level) => {
    return 5 * level ** 2 + 50 * level + 100;
};
exports.getNextLvlXP = getNextLvlXP;
