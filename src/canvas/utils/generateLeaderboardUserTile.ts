import { LeaderboardUserTileInfo } from "../../utils/interfaces";
import { Client, Role, User } from "discord.js";
import { Image, loadImage } from "canvas";
import { getNextLvlXP } from "../../utils/getNextLevelXP";
import { getStaticCanvasAssets } from "./staticAssetCache";

export const getCrownImage = async (rank: number) => {
  try {
    const assets = await getStaticCanvasAssets();
    return assets.crowns.get(rank);
  } catch (err) {
    console.error("Error loading crown image.", err);
    return undefined;
  }
};

const formatXpToK = (xp: number): string => {
  if (xp < 1000) return xp.toString();

  const formatted = (xp / 1000).toFixed(xp % 1000 === 0 ? 0 : 1);
  return `${formatted}k`;
};

export const fetchLeaderboardTileData = async (
  client: Client,
  userInfo: LeaderboardUserTileInfo
): Promise<{ user: User; avatar: Image }> => {
  const assets = await getStaticCanvasAssets();
  const defaultPfps = assets.defaultPfps;
  const fallbackAvatar =
    defaultPfps[Math.floor(Math.random() * defaultPfps.length)];

  try {
    const user = await client.users.fetch(userInfo.userID);
    const avatarUrl = user.displayAvatarURL({
      extension: "png",
      size: 256,
    });

    const res = await fetch(avatarUrl);
    if (!res.ok) {
      return { user, avatar: fallbackAvatar };
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const avatar = await loadImage(buffer);
    return { user, avatar };
  } catch (err) {
    try {
      const user = await client.users.fetch(userInfo.userID);
      return { user, avatar: fallbackAvatar };
    } catch {
      // create fallback dummy user object if user fetch fails
      const dummyUser = {
        displayName: "Unknown",
        username: "Unknown",
      } as unknown as User;
      return { user: dummyUser, avatar: fallbackAvatar };
    }
  }
};

export const generateLeaderboardUserTile = async (
  client: Client,
  userInfo: LeaderboardUserTileInfo,
  width: number,
  height: number,
  type: string,
  role?: Role,
  preloadedData?: { user: User; avatar: Image }
) => {
  const { createCanvas } = await import("canvas");
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  try {
    const { user, avatar } =
      preloadedData || (await fetchLeaderboardTileData(client, userInfo));

    // background
    const padding = 10;

    ctx.globalAlpha = 0.8;
    ctx.fillStyle = "#0c0d0c";
    ctx.beginPath();
    ctx.roundRect(
      padding,
      padding,
      width - padding * 2,
      height - padding * 2,
      20
    );
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.lineWidth = 7;
    ctx.strokeStyle = "#434445";
    ctx.beginPath();
    ctx.roundRect(
      padding,
      padding,
      width - padding * 2,
      height - padding * 2,
      20
    );
    ctx.closePath();
    ctx.stroke();

    // save current settings to prevent clipping
    const avatarSize = height * 0.6;
    const avatarX = padding * 6;
    const avatarY = height / 2 - avatarSize / 2 - 5;

    // Draw avatar as circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(
      avatarX + avatarSize / 2,
      avatarY + avatarSize / 2,
      avatarSize / 2,
      0,
      Math.PI * 2
    );
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    // load crowns if the rank is less than 3
    if (userInfo.rank < 4) {
      const crownImage = await getCrownImage(userInfo.rank);

      if (crownImage) {
        const crownWidth = avatarSize * 1;
        const crownHeight = crownWidth * (crownImage.height / crownImage.width);

        const crownX = avatarX + avatarSize / 2 - crownWidth / 2 - 60;
        const crownY = avatarY - crownHeight / 2 - 5;

        ctx.save();

        // Translate to center of crown
        ctx.translate(crownX + crownWidth / 2, crownY + crownHeight / 2);
        ctx.rotate((-30 * Math.PI) / 180); // convert degrees to radians

        // Draw crown centered at origin
        ctx.drawImage(
          crownImage,
          -crownWidth / 2,
          -crownHeight / 2,
          crownWidth,
          crownHeight
        );

        ctx.restore();
      }
    }

    // if ranking >=4 display the rank nummber
    if (userInfo.rank >= 4) {
      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 50px 'Segoe UI', sans-serif";
      ctx.fillText(userInfo.rank.toString() + ".", 25, 70);
      ctx.restore();
    }

    const baseY = 120;

    // Username
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 60px 'Segoe UI', sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText(user.displayName.split(" ")[0], 240, 160);

    // Level Label
    ctx.font = "40px 'Segoe UI', sans-serif";
    ctx.textBaseline = "bottom";
    ctx.fillText("Lvl:", 725, baseY - 10);

    // Level Value
    ctx.font = "bold 60px 'Segoe UI', sans-serif";
    ctx.fillText(userInfo.level.toString(), 795, baseY);

    // XP Label
    ctx.font = "40px 'Segoe UI', sans-serif";
    ctx.fillText("XP:", 910, baseY - 10);

    // XP Value
    ctx.font = "bold 60px 'Segoe UI', sans-serif";
    ctx.fillText(formatXpToK(userInfo.xp), 980, baseY);

    // if role exists make the role tag
    if (role) {
      const rectX = 700;
      const rectY = 150;
      const rectWidth = 500;
      const rectHeight = 85;

      // Draw the rectangle
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = role.hexColor;
      ctx.beginPath();
      ctx.roundRect(rectX, rectY, rectWidth, rectHeight, 20);
      ctx.closePath();
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.lineWidth = 4;
      ctx.strokeStyle = role.hexColor;
      ctx.beginPath();
      ctx.roundRect(rectX, rectY, rectWidth, rectHeight, 20);
      ctx.closePath();
      ctx.stroke();

      // Centered text inside
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 40px 'Segoe UI', sans-serif";
      ctx.fillText(role.name, rectX + rectWidth / 2, rectY + rectHeight / 2);

      // now we make a progress bar
      const progress_width = 650;
      const progress_height = 15;

      if (type === "none") {
        ctx.save();
        // progress base
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.roundRect(30, 220, progress_width, progress_height, 12);
        ctx.closePath();
        ctx.fill();

        // progress
        const totalXp = getNextLvlXP(userInfo.level);
        const progress = (userInfo.xp / totalXp) * progress_width;

        ctx.globalAlpha = 1;
        ctx.fillStyle = role.hexColor;
        ctx.beginPath();
        ctx.roundRect(30, 220, progress, progress_height, 12);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
  } catch (err) {
    console.error("Error in generating leaderboard user tile : ", err);
  }

  return canvas;
};
