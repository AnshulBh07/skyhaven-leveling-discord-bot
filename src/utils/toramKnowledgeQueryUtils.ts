import fs from "fs";
import path from "path";
import Fuse from "fuse.js";
import { ToramKnowledgeEntry } from "./interfaces";

const stopwords = new Set([
  "what", "is", "the", "of", "does", "do", "how", "much",
  "cost", "from", "this", "tell", "me", "about","skill",
  "tree", "show", "list", "all", "for", "seraphina",
]);

function cleanQuery(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopwords.has(word))
    .join(" ");
}

const toramFiles: ToramKnowledgeEntry[] = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../data/toramKnowledgeBase.json"),
    "utf-8"
  )
);

const toramFuse = new Fuse(toramFiles, {
  keys: [
    { name: "keywords", weight: 1 },
    { name: "aliases", weight: 0.8 },
    { name: "allText", weight: 0.3 },
  ],
  includeScore: true,
  includeMatches: true,
  threshold: 0.4,
  ignoreLocation: true,
  minMatchCharLength: 2,
});

export const matchPDFFile = (query: string): ToramKnowledgeEntry | null => {
  const cleaned = cleanQuery(query);
  const results = toramFuse.search(cleaned);

  if (!results.length) return null;

  const best = results[0];

  console.log("✅ Fuzzy match result:", {
    query,
    cleaned,
    file: best.item.name,
    score: best.score,
    matches: best.matches?.map(m => `${m.key}: ${m.value}`),
  });

  return best.item;
};
