import { getNextLvlXP } from "./getNextLevelXP";

export const getLvlFromXP = (totalXP: number) => {
  let level = 1;
  let currXp = 0;

  while (true) {
    const xpForNextLevel = getNextLvlXP(level);
    if (currXp + xpForNextLevel > totalXP) break;

    currXp += xpForNextLevel;
    level++;
  }

  return level;
};
