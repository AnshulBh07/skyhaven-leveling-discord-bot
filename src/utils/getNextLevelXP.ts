export const getNextLvlXP = (level: number) => {
  return 5 * level ** 2 + 50 * level + 100;
};
