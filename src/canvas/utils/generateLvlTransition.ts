import { createCanvas } from "canvas";
import { drawRoundedHexagonWithLevel } from "./drawRoundedHexagon";
import { drawArrow } from "./drawArrow";

export const generateLvlTransition = (
  previous_level: number,
  current_level: number,
  baseColor: string
) => {
  const canvas = createCanvas(800, 180);
  const ctx = canvas.getContext("2d");

  const roundedHexa1 = drawRoundedHexagonWithLevel(
    500,
    90,
    60,
    20,
    baseColor,
    previous_level.toString()
  );

  const arrow = drawArrow(575, 90, 625, 90, baseColor, 20);

  const roundedHexa2 = drawRoundedHexagonWithLevel(
    700,
    90,
    60,
    20,
    baseColor,
    current_level.toString()
  );

  ctx.drawImage(roundedHexa1, 0, 0);
  ctx.drawImage(arrow, 0, 0);
  ctx.drawImage(roundedHexa2, 0, 0);

  return canvas;
};
