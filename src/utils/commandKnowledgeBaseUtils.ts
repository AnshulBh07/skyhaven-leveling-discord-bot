import Fuse from "fuse.js";
import { CommandEntry } from "./interfaces";
import path from "path";
import fs from "fs";

export const getIntentScore = (query: string): number => {
  const lower = query.toLowerCase();
  let score = 0;

  // Strong command phrases
  if (lower.includes("how to")) score += 4;
  if (lower.includes("how do i")) score += 4;
  if (lower.startsWith("what does")) score += 3;
  if (lower.includes("usage") || lower.includes("use")) score += 2;
  if (lower.includes("submit") || lower.includes("start")) score += 3;
  if (lower.includes("delete") || lower.includes("remove")) score += 2;
  if (lower.includes("command") || lower.includes("cmd")) score += 3;
  if (lower.includes("where can i")) score += 2;
  if (
    lower.includes("show me") ||
    lower.includes("check") ||
    lower.includes("can i")
  )
    score += 2;
  if (lower.includes("see my") || lower.includes("view my")) score += 2;

  // Mentions of bot name (encourages intent)
  if (lower.includes("seraphina") || lower.includes("you")) score += 1;

  // Contains slash-style command
  if (lower.includes("/")) score += 2;

  // Ends with question mark — likely user is asking something
  if (lower.trim().endsWith("?")) score += 1;

  // Feature-related terms
  if (lower.includes("xp") || lower.includes("rank") || lower.includes("level"))
    score += 1;
  if (
    lower.includes("maze") ||
    lower.includes("quest") ||
    lower.includes("giveaway")
  )
    score += 1;
  if (lower.includes("leaderboard") || lower.includes("board")) score += 1;

  // Slight penalty for short/ambiguous messages
  if (lower.length < 8) score -= 1;

  return score;
};

export const matchCommand = (query: string): CommandEntry | null => {
  const commands: CommandEntry[] = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../data/commandKnowledgeBase.json"),
      "utf-8"
    )
  );

  const fuse = new Fuse(commands, {
    keys: [
      { name: "aliases", weight: 0.4 },
      { name: "name", weight: 0.3 },
      { name: "usage", weight: 0.1 },
      { name: "description", weight: 0.1 },
      { name: "examples", weight: 0.05 },
      { name: "notes", weight: 0.03 },
      { name: "category", weight: 0.02 },
    ],
    includeScore: true,
    includeMatches: true,
    threshold: 0.4,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });

  const results = fuse.search(query);

  if (!results.length) return null;

  const best = results[0];

  if (best.score !== undefined && best.score > 0.5) return null;

  console.log("✅ Command matched:", {
    command: best.item.name,
    score: best.score,
    matches: best.matches,
  });

  return best.item;
};

