import { seraphinaTemplates } from "../data/moodTemplates";
import { moodType } from "./interfaces";

type ErrorMessageKey =
  | "invalidCommand"
  | "configMissing"
  | "userNotFound"
  | "interactionTimeout";

type InfoMessageKey =
  | "generatingList"
  | "findingMessage"
  | "deletingMessage"
  | "updatingNotification"
  | "processingRequest"
  | "generatingLeaderboard"
  | "generatingRankCard"
  | "generatingUserStats";

type SuccessMessageKey = "submissionReceived";

// Function overloads to infer types correctly
export function getRandomMoodMessage(
  mood: moodType,
  category: "error",
  messageType: ErrorMessageKey
): string;
export function getRandomMoodMessage(
  mood: moodType,
  category: "info",
  messageType: InfoMessageKey
): string;
export function getRandomMoodMessage(
  mood: moodType,
  category: "success",
  messageType: SuccessMessageKey
): string;

export function getRandomMoodMessage(
  mood: moodType,
  category: "error" | "info" | "success",
  messageType: string
): string {
  const moodTemplate = seraphinaTemplates[mood];
  const categoryGroup = moodTemplate?.[category] as
    | Record<string, string[]>
    | undefined;

  const messages = categoryGroup?.[messageType];

  if (!Array.isArray(messages) || messages.length === 0) {
    return "Seraphina is speechless...";
  }

  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}
