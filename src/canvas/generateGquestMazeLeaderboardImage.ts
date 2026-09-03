import { AttachmentBuilder, Client, User } from "discord.js";
import { questMazeLeaderboardUser } from "../utils/interfaces";
import axios from "axios";
import { Image, loadImage } from "canvas";
import { getStaticCanvasAssets } from "./utils/staticAssetCache";

const getMedal = async (rank: number): Promise<{ color: string; medalImage?: Image }> => {
  const assets = await getStaticCanvasAssets();
  const medalImage = assets.medals.get(rank);

  switch (rank) {
    case 1:
      return { color: "#FFD700", medalImage };
    case 2:
      return { color: "#C0C0C0", medalImage };
    case 3:
      return { color: "#CD7F32", medalImage };
    default:
      return { color: "", medalImage: undefined };
  }
};

const fetchUserTileData = async (
  client: Client,
  dummyUser: questMazeLeaderboardUser
): Promise<{ user: User; avatar: Image }> => {
  const assets = await getStaticCanvasAssets();
  const defaultPfps = assets.defaultPfps;
  const fallbackAvatar =
    defaultPfps[Math.floor(Math.random() * defaultPfps.length)];

  try {
    const user = await client.users.fetch(dummyUser.userID);
    const avatarUrl = user.displayAvatarURL({ extension: "png", size: 256 });

    try {
      const response = await axios.get(avatarUrl, {
        responseType: "arraybuffer",
      });
      const buffer = Buffer.from(response.data as ArrayBuffer);
      const avatar = await loadImage(buffer);
      return { user, avatar };
    } catch {
      return { user, avatar: fallbackAvatar };
    }
  } catch {
    const dummy = {
      username: "Unknown",
    } as unknown as User;
    return { user: dummy, avatar: fallbackAvatar };
  }
};

export const generateGquestMazeLeaderboardImage = async (
  client: Client,
  users: questMazeLeaderboardUser[]
) => {
  const { createCanvas } = await import("canvas");
  const width = 900,
    height = 1280;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  try {
    const assets = await getStaticCanvasAssets();
    const bg =
      assets.questMazeBgs[
        Math.floor(Math.random() * assets.questMazeBgs.length)
      ];
    ctx.drawImage(bg, 0, 0, width, height);

    // Parallelize all 10 user info + avatar network downloads
    const preloadedData = await Promise.all(
      users.map((u) => fetchUserTileData(client, u))
    );

    const outerPadding = 15;
    const cardWidth = width - 2 * outerPadding;
    const cardHeight = (height - outerPadding * 2 - 9 * outerPadding) / 10;

    for (let i = 0; i < users.length; i++) {
      const dummyUser = users[i];
      const medalInfo = await getMedal(dummyUser.rank);
      const color = "#ffffff";

      const x = outerPadding;
      const y = outerPadding + i * (cardHeight + outerPadding);

      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "#0c0d0c";
      ctx.beginPath();
      ctx.roundRect(x, y, cardWidth, cardHeight, 12);
      ctx.closePath();
      ctx.fill();

      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = "#3b3b3b";
      ctx.beginPath();
      ctx.roundRect(x, y, cardWidth, cardHeight, 12);
      ctx.closePath();
      ctx.stroke();

      const textPlacementY = y + cardHeight / 2;
      const textPlacementX = x;

      ctx.fillStyle = medalInfo.color || color;
      ctx.font = "bold 40px 'Segoe UI', sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(`${dummyUser.rank}.`, textPlacementX + 30, textPlacementY);

      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(textPlacementX + 90, textPlacementY - 45, 90, 90, 20);
      ctx.closePath();
      ctx.fill();
      ctx.clip();

      const { user, avatar } = preloadedData[i];

      ctx.drawImage(avatar, textPlacementX + 90, textPlacementY - 45, 90, 90);
      ctx.restore();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 35px 'Segoe UI', sans-serif";
      ctx.fillText(user.username, textPlacementX + 200, textPlacementY);

      ctx.font = "25px 'Segoe UI', sans-serif";
      ctx.fillText("Completed : ", textPlacementX + 460, textPlacementY);

      ctx.font = "bold 35px 'Segoe UI', sans-serif";
      ctx.fillText(
        dummyUser.completed.toString(),
        textPlacementX + 600,
        textPlacementY
      );

      ctx.font = "25px 'Segoe UI', sans-serif";
      ctx.fillText("Score : ", textPlacementX + 678, textPlacementY);

      ctx.font = "bold 35px 'Segoe UI', sans-serif";
      ctx.fillText(
        dummyUser.contribution_score.toString(),
        textPlacementX + 760,
        textPlacementY
      );

      if (medalInfo.medalImage) {
        ctx.drawImage(medalInfo.medalImage, x + 55, y, 60, 60);
      }
    }
  } catch (err) {
    console.error(
      "Error generating guild quest or maze leaderboard canvas:",
      err
    );
  }

  const buffer = canvas.toBuffer("image/png");
  return new AttachmentBuilder(buffer, { name: "leaderboard.png" });
};
