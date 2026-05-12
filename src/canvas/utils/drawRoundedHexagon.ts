import { createCanvas } from "canvas";

export function drawRoundedHexagonWithLevel(
  x: number,
  y: number,
  size: number,
  cornerRadius: number,
  color: string,
  text: string,
  canvasWidth = 800,
  canvasHeight = 180
) {
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");

  const angleStep = (Math.PI * 2) / 6;

  function drawHexPath(r: number) {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = angleStep * i - Math.PI / 2;
      points.push({
        x: x + Math.cos(angle) * r,
        y: y + Math.sin(angle) * r
      });
    }

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % 6];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const offsetX = (dx / dist) * cornerRadius;
      const offsetY = (dy / dist) * cornerRadius;

      const startX = p1.x + offsetX;
      const startY = p1.y + offsetY;
      const endX = p2.x - offsetX;
      const endY = p2.y - offsetY;

      if (i === 0) {
        ctx.moveTo(startX, startY);
      } else {
        ctx.lineTo(startX, startY);
      }

      ctx.quadraticCurveTo(p2.x, p2.y, endX, endY);
    }
    ctx.closePath();
  }

  // Outer hexagon
  drawHexPath(size);
  ctx.fillStyle = color;
  ctx.fill();

  // Inner hexagon (ring effect)
  ctx.globalCompositeOperation = "destination-out";
  drawHexPath(size - 10);
  ctx.fill();

  // Reset and draw text
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = color;
  ctx.font = "bold 32px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);

  return canvas;
}
