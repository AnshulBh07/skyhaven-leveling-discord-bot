"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchPDFFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const fuse_js_1 = __importDefault(require("fuse.js"));
const stopwords = new Set([
    "what", "is", "the", "of", "does", "do", "how", "much",
    "cost", "from", "this", "tell", "me", "about", "skill",
    "tree", "show", "list", "all", "for", "seraphina",
]);
function cleanQuery(query) {
    return query
        .toLowerCase()
        .replace(/[^\w\s]/g, "") // remove punctuation
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopwords.has(word))
        .join(" ");
}
const toramFiles = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, "../data/toramKnowledgeBase.json"), "utf-8"));
const toramFuse = new fuse_js_1.default(toramFiles, {
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
const matchPDFFile = (query) => {
    var _a;
    const cleaned = cleanQuery(query);
    const results = toramFuse.search(cleaned);
    if (!results.length)
        return null;
    const best = results[0];
    console.log("✅ Fuzzy match result:", {
        query,
        cleaned,
        file: best.item.name,
        score: best.score,
        matches: (_a = best.matches) === null || _a === void 0 ? void 0 : _a.map(m => `${m.key}: ${m.value}`),
    });
    return best.item;
};
exports.matchPDFFile = matchPDFFile;
