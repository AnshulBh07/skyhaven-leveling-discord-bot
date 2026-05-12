import { createCanvas } from "canvas";
import { getLuminance } from "./getLuminance";
import { adjustHexColorBrightness } from "./adjustHexShades";

type placedBubble = { x: number; y: number; radius: number };

export const generateBackground = (bgColor: string, baseColor: string) => {
  const canvas = createCanvas(800, 180);
  const ctx = canvas.getContext("2d");

  const luminance = getLuminance(baseColor);
  const percOffset = 10;
  const percentagesArr = [50, 60, 70, 75, 80, 95, 40];
  const bubblesColors = (
    luminance < 0.5
      ? percentagesArr
      : percentagesArr.map((perc) => perc + percOffset)
  ).map((perc) => adjustHexColorBrightness(baseColor, perc));

  // base for card
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(0, 0, 850, 250, 15);
  ctx.closePath();
  ctx.fill();

  // tint for base
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(0, 0, 850, 250, 15);
  ctx.closePath();
  ctx.fill();

  const placedBubbles: placedBubble[] = [];

  // bubbles on card
  bubblesColors.forEach((color) => {
    let attempts = 0;
    let placed = 0;

    while (placed < 3 && attempts < 100) {
      const radius = 10 + Math.random() * 25;
      const x = Math.random() * (800 - 2 * radius) + radius;
      const y = Math.random() * (180 - 2 * radius) + radius;

      const overlaps = placedBubbles.some((b) => {
        const dx = b.x - x;
        const dy = b.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < b.radius + radius + 20; // 5px padding
      });

      if (!overlaps) {
        ctx.globalAlpha = luminance < 0.5 ? Math.random() * 0.5 : 0.5;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        placedBubbles.push({ x, y, radius });
        placed++;
      }

      attempts++;
    }
  });

  // avatar background shadow
  const offset = 10;
  ctx.globalAlpha = 1;
  ctx.fillStyle = baseColor;
  ctx.beginPath();
  ctx.arc(100 - offset, 180 / 2 - offset, 60, 0, Math.PI * 2);
  ctx.fill();

  //   frame for level transition
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(425, 20, 350, 140, 12);
  ctx.fill();

  return canvas;
};
