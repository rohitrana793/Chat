import express from "express";
import { openaiClient } from "../app.js";

const router = express.Router();

// -------------------------------------------
// 1️⃣ LOCAL TOXIC WORD LIST (FAST, NO API)
// -------------------------------------------
const localToxicWords = [
  "kill",
  "bomb",
  "suicide",
  "rape",
  "shoot",
  "attack",
  "hate",
  "bitch",
  "bastard",
  "ugly",
  "idiot",
  "stupid",
  "harass",
  "threat",
];

const containsLocalToxic = (msg) => {
  const lower = msg.toLowerCase();
  return localToxicWords.find((word) => lower.includes(word));
};

// -------------------------------------------
// 2️⃣ OPENAI INIT
// -------------------------------------------

// -------------------------------------------
// 3️⃣ RATE LIMIT PROTECTION (ONE CALL / 3 SECONDS)
// -------------------------------------------
let lastModerationCall = 0;
const COOL_DOWN = 3000; // 3 seconds

async function safeModerationCheck(message) {
  const now = Date.now();

  // Prevent rate-limit spam
  if (now - lastModerationCall < COOL_DOWN) {
    console.log("⏳ Skipping OpenAI call (cooldown)");
    return { flagged: false, skipped: true };
  }

  lastModerationCall = now;

  return await openaiClient.moderations.create({
    model: "omni-moderation-latest",
    input: message,
  });
}

// -------------------------------------------
// 4️⃣ MAIN ROUTE — FULL OPTIMIZED FLOW
// -------------------------------------------
router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.json({ isToxic: false });

    // STEP 1 → LOCAL CHECK (no API call)
    const matched = containsLocalToxic(message);
    if (matched) {
      return res.json({
        isToxic: true,
        source: "local",
        matchedWord: matched,
      });
    }

    // STEP 2 → SAFE AI CHECK (cooldown applied)
    const aiResponse = await safeModerationCheck(message);

    if (aiResponse.skipped) {
      return res.json({
        isToxic: false,
        skipped: true,
        reason: "Cooldown: AI moderation skipped",
      });
    }

    const result = aiResponse.results[0];

    const aiToxic =
      result.categories.harassment ||
      result.categories.hate ||
      result.categories.violence ||
      result.categories["self-harm"] ||
      result.categories.abuse ||
      result.categories["hate/threatening"];

    return res.json({
      isToxic: aiToxic,
      source: "openai",
    });
  } catch (error) {
    console.error("🔥 Moderation error:", error.message);

    // SAFE FALLBACK → NEVER BLOCK MESSAGES
    return res.status(200).json({
      isToxic: false,
      error: true,
      reason: "OpenAI failed — message allowed",
    });
  }
});

export default router;
