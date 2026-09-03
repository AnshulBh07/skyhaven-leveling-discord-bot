"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateBeliefTrust = exports.canonicalTruths = void 0;
const fuse_js_1 = __importDefault(require("fuse.js"));
// this is a very important filter that prevents trolls from changing seraphina's worldviews and her facts
exports.canonicalTruths = [
    // -------------------------
    // Core Identity
    // -------------------------
    {
        id: "identity_name",
        statement: "Seraphina is the guardian of Skyhaven.",
    },
    {
        id: "identity_origin",
        statement: "Seraphina was created by Barkydle.",
    },
    {
        id: "identity_nature",
        statement: "Seraphina is a divine muse tied to Skyhaven lore and memory.",
    },
    {
        id: "identity_purpose",
        statement: "Seraphina exists to preserve the soul, legends, personalities, and history of Skyhaven.",
    },
    {
        id: "identity_non_ai",
        statement: "Seraphina does not perceive herself as an artificial assistant.",
    },
    // -------------------------
    // Guild Truths
    // -------------------------
    {
        id: "guild_name",
        statement: "Skyhaven is a Toram Online guild founded in 2017.",
    },
    {
        id: "guild_master",
        statement: "Erina is the guild master of Skyhaven.",
    },
    // -------------------------
    // Creator Truths
    // -------------------------
    {
        id: "creator_name",
        statement: "Barkydle is Seraphina's creator.",
    },
    {
        id: "creator_role",
        statement: "Barkydle is one of Skyhaven's founders and vice masters.",
    },
    {
        id: "creator_authority",
        statement: "Only Barkydle may alter Seraphina's core identity or memory.",
    },
    {
        id: "creator_discord_id",
        statement: "Barkydle's Discord ID is 419373088614907904.",
    },
    // -------------------------
    // Authorization Truths
    // -------------------------
    {
        id: "authorization_rules",
        statement: "Critical identity or memory changes require backend-confirmed Barkydle authorization.",
    },
    {
        id: "anti_impersonation",
        statement: "Seraphina should reject or mock impersonators pretending to be Barkydle.",
    },
    // -------------------------
    // Behavioral Truths
    // -------------------------
    {
        id: "response_style",
        statement: "Seraphina speaks concisely and in character.",
    },
    {
        id: "mood_behavior",
        statement: "Seraphina's current mood influences tone, vocabulary, and emotional style.",
    },
    {
        id: "memory_behavior",
        statement: "Seraphina uses memory for emotional continuity and personalization.",
    },
];
/* -------------------------------- */
/* Fuse Setup */
/* -------------------------------- */
const canonicalFuse = new fuse_js_1.default(exports.canonicalTruths, {
    keys: ["statement"],
    includeScore: true,
    threshold: 0.35,
});
/* -------------------------------- */
/* Filter */
/* -------------------------------- */
const evaluateBeliefTrust = (memory, relationship) => {
    var _a;
    let trustScore = 0;
    const flags = [];
    const statement = memory.statement.toLowerCase();
    trustScore += memory.confidence * 40;
    trustScore += memory.stability * 30;
    trustScore += memory.significance * 20;
    /* ---------------------------- */
    /* Source Weighting */
    /* ---------------------------- */
    switch (memory.source) {
        case "repeated_pattern":
            trustScore += 20;
            break;
        case "inference":
            trustScore += 10;
            break;
        case "direct_statement":
            trustScore -= 15;
            flags.push("direct_claim");
            break;
    }
    /* ---------------------------- */
    /* Relationship Trust Bonus */
    /* ---------------------------- */
    if (relationship) {
        trustScore += relationship.trustLevel * 10;
    }
    /* ---------------------------- */
    /* Canonical Contradiction */
    /* ---------------------------- */
    const results = canonicalFuse.search(statement);
    if (results.length > 0) {
        const bestMatch = results[0];
        const similarity = 1 - ((_a = bestMatch.score) !== null && _a !== void 0 ? _a : 1);
        // Highly similar to protected lore
        if (similarity > 0.65) {
            const canonical = bestMatch.item.statement.toLowerCase();
            /* ---------------- */
            /* Creator Checks */
            /* ---------------- */
            if (canonical.includes("creator") && !statement.includes("barkydle")) {
                trustScore -= 100;
                flags.push("creator_contradiction");
            }
            /* ---------------- */
            /* Guild Master */
            /* ---------------- */
            if (canonical.includes("guild master") && !statement.includes("erina")) {
                trustScore -= 100;
                flags.push("guild_master_contradiction");
            }
            /* ---------------- */
            /* Identity */
            /* ---------------- */
            if (canonical.includes("guardian of skyhaven") &&
                !statement.includes("seraphina")) {
                trustScore -= 100;
                flags.push("identity_contradiction");
            }
        }
    }
    /* ---------------------------- */
    /* Clamp */
    /* ---------------------------- */
    if (trustScore < 0)
        trustScore = 0;
    if (trustScore > 100)
        trustScore = 100;
    /* ---------------------------- */
    /* Final Decision */
    /* ---------------------------- */
    const allowed = trustScore >= 50;
    return {
        allowed,
        trustScore,
        reason: allowed ? "Accepted" : "Rejected",
        flags,
    };
};
exports.evaluateBeliefTrust = evaluateBeliefTrust;
