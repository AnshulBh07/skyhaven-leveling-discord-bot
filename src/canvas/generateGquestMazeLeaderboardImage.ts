import getAllFiles from "../utils/getAllFiles";
import path from "path";
import { AttachmentBuilder, Client } from "discord.js";
import { questMazeLeaderboardUser } from "../utils/interfaces";
import fetch from "node-fetch";

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
    // get images for bg
    const allBgs = getAllFiles(
      path.join(__dirname, "..", "assets/images/quest_maze_bg"),
      false
    );

    const randomBg = allBgs[Math.floor(Math.random() * allBgs.length)];

    const bg = await loadImage(randomBg);
    ctx.drawImage(bg, 0, 0, width, height);

    // dummy data
    // const dummyUser: questMazeLeaderboardUser = {
    //   userID: "419373088614907904",
    //   rank: 2,
    //   completed: 10,
    //   contribution_score: 156,
    // };

    /// Card config
    const outerPadding = 15;
    const cardWidth = width - 2 * outerPadding;
    const cardHeight = (height - outerPadding * 2 - 9 * outerPadding) / 10;

    for (let i = 0; i < users.length; i++) {
      const dummyUser = users[i];
      //   medal for rank
      const [rankColor, medalUrl] = getMedalColor(dummyUser.rank);
      let color = "#ffffff";

      const x = outerPadding;
      const y = outerPadding + i * (cardHeight + outerPadding);

      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "#0c0d0c";
      ctx.beginPath();
      ctx.roundRect(x, y, cardWidth, cardHeight, 12);
      ctx.closePath();
      ctx.fill();

      // Reset alpha if you'll draw something else later:
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = "#3b3b3b";
      ctx.beginPath();
      ctx.roundRect(x, y, cardWidth, cardHeight, 12);
      ctx.closePath();
      ctx.stroke();

      const textPlacementY = y + cardHeight / 2;
      const textPlacementX = x;
      //   ranking number
      ctx.fillStyle = rankColor && rankColor.length > 0 ? rankColor : color;
      ctx.font = "bold 40px 'Segoe UI', sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(`${dummyUser.rank}.`, textPlacementX + 30, textPlacementY);

      //   avatar
      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(textPlacementX + 90, textPlacementY - 45, 90, 90, 20);
      ctx.closePath();
      ctx.fill();
      ctx.clip();

      const user = await client.users.fetch(dummyUser.userID);
      const avatarUrl = user.displayAvatarURL({ extension: "png", size: 256 });

      const res = await fetch(avatarUrl);

      let arrayBuffer: ArrayBuffer;
      let buffer: Buffer<ArrayBuffer>;
      let avatar: InstanceType<typeof Image>;

      // get random default pfps
      const defaultPfp = getAllFiles(
        path.join(__dirname, "..", "assets/images/default_pfp"),
        false
      );

      if (!res.ok) {
        avatar = await loadImage(
          defaultPfp[Math.floor(Math.random() * defaultPfp.length)]
        );
      } else {
        arrayBuffer = await res.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
        avatar = await loadImage(buffer);
      }

      ctx.drawImage(avatar, textPlacementX + 90, textPlacementY - 45, 90, 90);
      ctx.restore();

      //   user name
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 35px 'Segoe UI', sans-serif";
      ctx.fillText(user.username, textPlacementX + 200, textPlacementY);

      //   completed
      ctx.font = "25px 'Segoe UI', sans-serif";
      ctx.fillText("Completed : ", textPlacementX + 460, textPlacementY);

      ctx.font = "bold 35px 'Segoe UI', sans-serif";
      ctx.fillText(
        dummyUser.completed.toString(),
        textPlacementX + 600,
        textPlacementY
      );

      //   score
      ctx.font = "25px 'Segoe UI', sans-serif";
      ctx.fillText("Score : ", textPlacementX + 678, textPlacementY);

      ctx.font = "bold 35px 'Segoe UI', sans-serif";
      ctx.fillText(
        dummyUser.contribution_score.toString(),
        textPlacementX + 760,
        textPlacementY
      );

      //   add medal if medal is valid
      if (medalUrl && medalUrl.length > 0) {
        const medal = await loadImage(medalUrl);

        ctx.drawImage(medal, x + 55, y, 60, 60);
      }
    }
  } catch (err) {
    console.error(
      "Error generating guild quest or maze leaderboard canvas : ",
      err
    );
  }

  const buffer = canvas.toBuffer("image/png");
  const card = new AttachmentBuilder(buffer, {
    name: "leaderboard.png",
  }).setName("leaderboard.png");
  return card;
};
