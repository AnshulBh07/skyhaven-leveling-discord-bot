import { AttachmentBuilder, User } from "discord.js";
import { generateBackground } from "./utils/generateBackground";
import { getLuminance } from "./utils/getLuminance";
import {
  darkBackgroundColors,
  lightBackgroundColors,
} from "../data/helperArrays";
import { generateLvlTransition } from "./utils/generateLvlTransition";
import { createCanvas } from "canvas";
import { generateAvatar } from "./utils/generateAvatar";

export const generateLvlUpCard = async (
  user: User,
  previous_level: number,
  current_level: number
) => {
  try {
    const canvas = createCanvas(800, 180);
    const ctx = canvas.getContext("2d");

    const baseColor = !user.accentColor
      ? "#0051a8"
      : `#${user.accentColor.toString(16).padStart(6, "0")}`;

    const luminance = getLuminance(baseColor);

    const lightTheme =
      lightBackgroundColors[
        Math.floor(Math.random() * lightBackgroundColors.length)
      ];

    const darkTheme =
      darkBackgroundColors[
        Math.floor(Math.random() * darkBackgroundColors.length)
      ];

    const bgColor = luminance > 0.5 ? darkTheme : lightTheme;

    const bgCanvas = generateBackground(user, bgColor, baseColor);
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
