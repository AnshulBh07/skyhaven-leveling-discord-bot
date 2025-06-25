import getAllFiles from "../utils/getAllFiles";
import path from "path";
import { AttachmentBuilder, Client } from "discord.js";
import { questMazeLeaderboardUser } from "../utils/interfaces";
import axios from "axios";

const getMedalColor = (rank: number) => {
  const allLogos = getAllFiles(path.join(__dirname, "../assets/logos"), false);

  switch (rank) {
    case 1:
      return ["#FFD700", allLogos.find((logo) => logo.includes("gold_medal"))];
    case 2:
      return [
        "#C0C0C0",
        allLogos.find((logo) => logo.includes("silver_medal")),
      ];
    case 3:
      return [
        "#CD7F32",
        allLogos.find((logo) => logo.includes("bronze_medal")),
      ];
    default:
      return ["", ""];
  }
};

export const generateGquestMazeLeaderboardImage = async (
  client: Client,
  users: questMazeLeaderboardUser[]
) => {
  const { createCanvas, Image, loadImage } = await import("canvas");
  const width = 900,
    height = 1280;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  try {
    const allBgs = getAllFiles(
      path.join(__dirname, "..", "assets/images/quest_maze_bg"),
      false
    );
    const randomBg = allBgs[Math.floor(Math.random() * allBgs.length)];
    const bg = await loadImage(randomBg);
    ctx.drawImage(bg, 0, 0, width, height);

    const outerPadding = 15;
    const cardWidth = width - 2 * outerPadding;
    const cardHeight = (height - outerPadding * 2 - 9 * outerPadding) / 10;

    for (let i = 0; i < users.length; i++) {
      const dummyUser = users[i];
      const [rankColor, medalUrl] = getMedalColor(dummyUser.rank);
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

      ctx.fillStyle = rankColor || color;
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

      const user = await client.users.fetch(dummyUser.userID);
      const avatarUrl = user.displayAvatarURL({ extension: "png", size: 256 });

      const defaultPfp = getAllFiles(
        path.join(__dirname, "..", "assets/images/default_pfp"),
        false
      );

      let avatar: InstanceType<typeof Image>;

      try {
        const response = await axios.get(avatarUrl, {
          responseType: "arraybuffer",
        });
        const buffer = Buffer.from(response.data as ArrayBuffer);
        avatar = await loadImage(buffer);
      } catch {
        avatar = await loadImage(
          defaultPfp[Math.floor(Math.random() * defaultPfp.length)]
        );
      }

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

      if (medalUrl) {
        const medal = await loadImage(medalUrl);
        ctx.drawImage(medal, x + 55, y, 60, 60);
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
