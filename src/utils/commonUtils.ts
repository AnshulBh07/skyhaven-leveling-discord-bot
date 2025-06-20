import { AttachmentBuilder } from "discord.js";
import { leaderboardThumbnail } from "../data/helperArrays";

export const getThumbnail = () => {
  const thumbnail = new AttachmentBuilder(leaderboardThumbnail).setName(
    "thumbnail.png"
  );
  return thumbnail;
};

export const getRandomImage = (imagesArr: string[]) => {
  return imagesArr[Math.floor(Math.random() * imagesArr.length)];
};
