import { AttachmentBuilder, Client, Role } from "discord.js";
import {
  fetchLeaderboardTileData,
  generateLeaderboardUserTile,
} from "./utils/generateLeaderboardUserTile";
import { LeaderboardUserTileInfo } from "../utils/interfaces";

export const generateLeaderboardCanvas = async (
  client: Client,
  leaderboardList: LeaderboardUserTileInfo[],
  type: string,
  bgImage: any,
  roles: Role[]
) => {
  const { createCanvas, loadImage } = await import("canvas");
  const width = 2600;
  const height = 1600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  try {
    const loadedBg =
      typeof bgImage === "string" ? await loadImage(bgImage) : bgImage;
    ctx.drawImage(loadedBg, 0, 0, width, height);

    // Parallelize user info + avatar network downloads across all tiles
    const preloadedTilesData = await Promise.all(
      leaderboardList.map((userInfo) =>
        fetchLeaderboardTileData(client, userInfo)
      )
    );

    const columns = 2;
    const rows = 5;
    const padding = 50;

    const tileWidth = (width - padding * (columns + 1)) / columns;
    const tileHeight = (height - padding * (rows + 1)) / rows;

    for (let i = 0; i < leaderboardList.length; i++) {
      const col = Math.floor(i / rows);
      const row = i % rows;

      const x = padding + col * (tileWidth + padding);
      const y = padding + row * (tileHeight + padding);

      const role = roles.find(
        (role) => role.id === leaderboardList[i].currentRole
      );

      const tileCanvas = await generateLeaderboardUserTile(
        client,
        leaderboardList[i],
        tileWidth,
        tileHeight,
        type,
        role,
        preloadedTilesData[i]
      );

      ctx.drawImage(tileCanvas, x, y, tileWidth, tileHeight);
    }

    const buffer = canvas.toBuffer("image/png");

    return new AttachmentBuilder(buffer, {
      name: "bg.png",
    });
  } catch (err) {
    console.error("❌ Error generating leaderboard canvas:", err);
    return undefined;
  }
};
