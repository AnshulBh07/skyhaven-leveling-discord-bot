import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import getAllFiles from "./getAllFiles";
import path from "path";
import { AttachmentBuilder } from "discord.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getRelativeDiscordTime = (day: number, time: string): number => {
  const [hour, minute] = time.split(":").map(Number);

  // Current JST time
  const now = dayjs().tz("Asia/Tokyo");

  // Get next occurrence of specified day
  let target = now.day(day).hour(hour).minute(minute).second(0).millisecond(0);

  // If it's earlier in the week or same day but time already passed, add 7 days
  if (target.isBefore(now)) {
    target = target.add(7, "day");
  }

  const unix = Math.floor(target.unix()); // Discord wants seconds, not ms

  return unix; // Relative time format (e.g. "in 2 days")
};

export const getRandomRaidImage = () => {
  const allImages = getAllFiles(
    path.join(__dirname, "..", "assets/images/raid_ss"),
    false
  );

  const randomImage = allImages[Math.floor(Math.random() * allImages.length)];

  const image = new AttachmentBuilder(randomImage).setName("raid.png");

  return image;
};
