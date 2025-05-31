import axios from "axios";
import colorthief from "colorthief";
import { rgbToHex } from "./rgbToHex";

export const getDominantColor = async (avatarUrl: string) => {
  try {
    const response = await axios.get(avatarUrl, {
      responseType: "arraybuffer",
    });
    const buffer = Buffer.from(response.data as ArrayBuffer);

    const dominantColor = await colorthief.getColor(buffer);

    const dominantColorHex = rgbToHex(...dominantColor);

    return dominantColorHex;
  } catch (err) {
    console.error(err);
    return "#0051a8";
  }
};
