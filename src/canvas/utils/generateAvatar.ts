import { User } from "discord.js";
import path from "path";
import getAllFiles from "../../utils/getAllFiles";

// function generates avatar and name
export const generateAvatar = async (
  user: User,
  themeColor: string,
  baseColor: string,
  size = 126
) => {
  const { createCanvas, Image, loadImage } = await import("canvas");
  const canvas = createCanvas(800, 180);
  const ctx = canvas.getContext("2d");

  try {
    const avatarURL = user.displayAvatarURL({ extension: "png", size: 256 });
    let avatar: InstanceType<typeof Image>;

    // get random default pfps
    const defaultPfp = getAllFiles(
      path.join(__dirname, "../..", "assets/images/default_pfp"),
      false
    );

    try {
      const response = await axios.get(avatarURL, {
        responseType: "arraybuffer",
      });
      const buffer = Buffer.from(response.data as ArrayBuffer);
      avatar = await loadImage(buffer);
    } catch {
      avatar = await loadImage(
        defaultPfp[Math.floor(Math.random() * defaultPfp.length)]
      );
    }

    const borderWidth = 5;

    // name/usertag
    ctx.fillStyle = baseColor;
    ctx.font = "bold 40px 'Segoe UI', sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(user.displayName, 170, 85);

    // image background for border
    ctx.globalAlpha = 1;
    ctx.fillStyle = themeColor;
    ctx.beginPath();
    ctx.arc(100, 180 / 2, 55 + borderWidth, 0, Math.PI * 2);
    ctx.fill();

    // avatar
    ctx.beginPath();
    ctx.arc(100, 180 / 2, 55, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(avatar, 100 - 55, 90 - 55, 110, 110);
  } catch (err) {
    console.error(err);
  }

  return canvas;
};
