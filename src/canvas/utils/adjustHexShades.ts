import { rgbToHex } from "./rgbToHex";

export function adjustHexColorBrightness(hex: string, percent: number) {
  // Ensure hex starts with #
  if (hex.startsWith("#")) hex = hex.slice(1);

  // Convert 3-digit hex to 6-digit
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  // Convert to RGB
  const num = parseInt(hex, 16);
  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;

  // Adjust each component
  r = Math.min(255, Math.max(0, Math.floor(r + (percent / 100) * r)));
  g = Math.min(255, Math.max(0, Math.floor(g + (percent / 100) * g)));
  b = Math.min(255, Math.max(0, Math.floor(b + (percent / 100) * b)));

  // Convert back to hex
  return rgbToHex(r, g, b);
}

export function makeColorReadableOnWhite(
  hex: string,
  minLightness = 40
): string {
  // Strip # if present
  if (hex.startsWith("#")) hex = hex.slice(1);

  // Expand shorthand
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  // Adjust lightness if too bright
  const newL = Math.min(l, minLightness / 100);

  // Convert back to RGB
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = newL < 0.5 ? newL * (1 + s) : newL + s - newL * s;
  const p = 2 * newL - q;
  const r2 = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const g2 = Math.round(hue2rgb(p, q, h) * 255);
  const b2 = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);

  const toHex = (c: number) => c.toString(16).padStart(2, "0");
  return `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`;
}
