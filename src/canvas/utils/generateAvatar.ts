import { createCanvas, Image, loadImage } from "canvas";
import { User } from "discord.js";
import fetch from "node-fetch";
import path from "path";
import getAllFiles from "../../utils/getAllFiles";

// function generates avatar and name
export const generateAvatar = async (
  user: User,
  themeColor: string,
  baseColor: string,
  size = 126
) => {
  const canvas = createCanvas(800, 180);
  const ctx = canvas.getContext("2d");

  try {
    const avatarURL = user.displayAvatarURL({ extension: "png", size: 256 });
    const res = await fetch(avatarURL);

    let arrayBuffer: ArrayBuffer;
    let buffer: Buffer<ArrayBuffer>;
    let avatar: Image;

    // get random default pfps
    const defaultPfp = getAllFiles(
      path.join(__dirname, "../..", "assets/images/default_pfp"),
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

    const borderWidth = 5;
    // name/usertag
    ctx.fillStyle = baseColor;
    ctx.font = "bold 40px 'Segoe UI', sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(user.tag, 170, 85);

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
