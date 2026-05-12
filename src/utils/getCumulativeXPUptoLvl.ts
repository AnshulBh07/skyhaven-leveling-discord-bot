import { getNextLvlXP } from "./getNextLevelXP";

export const getCumulativeXPUptoLvl = (level: number) => {
  let xp = 0;

  while (--level) {
    xp += getNextLvlXP(level);
  }

  return xp;
};
