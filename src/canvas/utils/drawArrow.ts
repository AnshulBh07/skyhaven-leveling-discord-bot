import { createCanvas } from "canvas";

export function drawArrow(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
  size: number = 12
) {
  const canvas = createCanvas(800, 180);
  const ctx = canvas.getContext("2d");

  const angle = Math.atan2(toY - fromY, toX - fromX);

  ctx.strokeStyle = color;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";

  // Draw main shaft
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  // Draw arrowhead as two lines (angled outward, rounded ends)
  const headLength = size;

  const angleOffset = Math.PI / 5; // adjust for arrowhead angle

  const leftX = toX - headLength * Math.cos(angle - angleOffset);
  const leftY = toY - headLength * Math.sin(angle - angleOffset);

  const rightX = toX - headLength * Math.cos(angle + angleOffset);
  const rightY = toY - headLength * Math.sin(angle + angleOffset);

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(leftX, leftY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(rightX, rightY);
  ctx.stroke();

  return canvas;
}
