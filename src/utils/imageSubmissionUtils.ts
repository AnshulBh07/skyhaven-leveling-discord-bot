import Tesseract from "tesseract.js";
import { imageHash as rawImageHash } from "image-hash";
import path from "path";
import fs1 from "fs";
import fs2 from "fs/promises";
import axios from "axios";
import { Readable } from "stream";
import sharp from "sharp";

// Extract text from image using Tesseract OCR
export const extractText = async (filePath: string): Promise<string> => {
  try {
    const result = await Tesseract.recognize(filePath, "eng", {
      logger: (m) => console.log(m),
    });
    return result.data.text.trim();
  } catch (err) {
    console.error("❌ Error extracting image text:", err);
    return "";
  }
};

// Generate perceptual hash from image
export const imageHash = async (filePath: string): Promise<string> => {
  return await new Promise((resolve, reject) => {
    rawImageHash(filePath, 16, true, (err: any, hash: any) => {
      if (err) reject(err);
      else resolve(hash);
    });
  });
};

// Download image from a Discord attachment URL
export const downloadDiscordImage = async (
  url: string,
  filename: string
): Promise<string> => {
  const dirPath = path.join(__dirname, "../assets/images/temp");
  if (!fs1.existsSync(dirPath)) {
    fs1.mkdirSync(dirPath, { recursive: true });
  }

  const localPath = path.join(dirPath, filename);
  const writer = fs1.createWriteStream(localPath);

  const response = await axios.get<Readable>(url, {
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(localPath));
    writer.on("error", reject);
  });
};

// Crop and preprocess bottom-right part of image for better OCR
export const cropBottomRight = async (
  filePath: string,
  cropWidth = 900,
  cropHeight = 200
): Promise<string> => {
  const metadata = await sharp(filePath).metadata();
  const width = metadata.width ?? 1024;
  const height = metadata.height ?? 1024;

  const outputPath = path.join(
    path.dirname(filePath),
    `cropped-${path.basename(filePath)}`
  );

  await sharp(filePath)
    .extract({
      left: Math.max(0, width - cropWidth),
      top: Math.max(0, height - cropHeight),
      width: cropWidth,
      height: cropHeight,
    })
    .grayscale()
    .normalize()
    .modulate({ brightness: 1.2 })
    .sharpen()
    .toFile(outputPath);

  return outputPath;
};

export const preprocessImage = async (inputPath: string): Promise<string> => {
  const outputPath = path.join(
    path.dirname(inputPath),
    `preprocessed-${path.basename(inputPath)}`
  );

  await sharp(inputPath)
    .grayscale()
    .resize({ width: 1200 }) // Increase resolution
    .modulate({ brightness: 1.5 }) // Improve contrast
    .threshold(160) // Binarize for sharp edges
    .normalize()
    .sharpen() // Help define text edges
    .toFile(outputPath);

  return outputPath;
};

export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    await fs2.unlink(filePath);
    console.log(`🧹 Deleted: ${filePath}`);
  } catch (err) {
    console.warn(`⚠️ Could not delete ${filePath}:`, err);
  }
};
