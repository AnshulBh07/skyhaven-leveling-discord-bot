import path from "path";
import { Image, loadImage } from "canvas";
import getAllFiles from "../../utils/getAllFiles";

interface StaticCanvasAssets {
  crowns: Map<number, Image>;
  medals: Map<number, Image>;
  defaultPfps: Image[];
  leaderboardBgs: Image[];
  questMazeBgs: Image[];
}

let cachedAssets: StaticCanvasAssets | null = null;

export const getStaticCanvasAssets = async (): Promise<StaticCanvasAssets> => {
  if (cachedAssets) return cachedAssets;

  const logosDir = path.join(__dirname, "../..", "assets/logos");
  const defaultPfpDir = path.join(__dirname, "../..", "assets/images/default_pfp");
  const lbBgDir = path.join(__dirname, "../..", "assets/images/leaderboard_bg");
  const qmBgDir = path.join(__dirname, "../..", "assets/images/quest_maze_bg");

  const logoFiles = getAllFiles(logosDir, false);
  const defaultPfpFiles = getAllFiles(defaultPfpDir, false);
  const lbBgFiles = getAllFiles(lbBgDir, false);
  const qmBgFiles = getAllFiles(qmBgDir, false);

  const crowns = new Map<number, Image>();
  const goldCrownPath = logoFiles.find((f) => f.includes("gold_crown"));
  const silverCrownPath = logoFiles.find((f) => f.includes("silver_crown"));
  const bronzeCrownPath = logoFiles.find((f) => f.includes("bronze_crown"));

  if (goldCrownPath) crowns.set(1, await loadImage(goldCrownPath));
  if (silverCrownPath) crowns.set(2, await loadImage(silverCrownPath));
  if (bronzeCrownPath) crowns.set(3, await loadImage(bronzeCrownPath));

  const medals = new Map<number, Image>();
  const goldMedalPath = logoFiles.find((f) => f.includes("gold_medal"));
  const silverMedalPath = logoFiles.find((f) => f.includes("silver_medal"));
  const bronzeMedalPath = logoFiles.find((f) => f.includes("bronze_medal"));

  if (goldMedalPath) medals.set(1, await loadImage(goldMedalPath));
  if (silverMedalPath) medals.set(2, await loadImage(silverMedalPath));
  if (bronzeMedalPath) medals.set(3, await loadImage(bronzeMedalPath));

  const defaultPfps: Image[] = [];
  for (const file of defaultPfpFiles) {
    defaultPfps.push(await loadImage(file));
  }

  const leaderboardBgs: Image[] = [];
  for (const file of lbBgFiles) {
    leaderboardBgs.push(await loadImage(file));
  }

  const questMazeBgs: Image[] = [];
  for (const file of qmBgFiles) {
    questMazeBgs.push(await loadImage(file));
  }

  cachedAssets = {
    crowns,
    medals,
    defaultPfps,
    leaderboardBgs,
    questMazeBgs,
  };

  return cachedAssets;
};
