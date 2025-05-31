import { AttachmentBuilder, User } from "discord.js";
import { generateBackground } from "./utils/generateBackground";
import { generateLvlTransition } from "./utils/generateLvlTransition";
import { createCanvas } from "canvas";
import { generateAvatar } from "./utils/generateAvatar";
import { getDominantColor } from "./utils/getDominantColor";
import { makeColorReadableOnWhite } from "./utils/adjustHexShades";

export const generateLvlUpCard = async (
  user: User,
  previous_level: number,
  current_level: number
) => {
  try {
    const canvas = createCanvas(800, 180);
    const ctx = canvas.getContext("2d");
    const avatarUrl = user.displayAvatarURL({ extension: "jpg", size: 256 });
    const dominantColor = await getDominantColor(avatarUrl);

    const baseColor = makeColorReadableOnWhite(dominantColor, 60);

    const bgColor = "#ffffff";

    const bgCanvas = generateBackground(dominantColor, baseColor);
    const lvlTransitionCanvas = generateLvlTransition(
      previous_level,
      current_level,
      baseColor
    );
    const avatarCanvas = await generateAvatar(user, bgColor, baseColor);

    ctx.drawImage(bgCanvas, 0, 0);
    ctx.drawImage(lvlTransitionCanvas, 0, 0);
    ctx.drawImage(avatarCanvas, 0, 0);

    const buffer = canvas.toBuffer();

    const card = new AttachmentBuilder(buffer, { name: "lvlupCard.png" });

    return card;
  } catch (err) {
    console.error(err);
    return undefined;
  }
};
