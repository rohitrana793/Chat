import express from "express";
import OpenAI from "openai";
import { openaiClient } from "../app.js";

const router = express.Router();

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

router.post("/", async (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(200).json({ suggestions: [] });
  }

  try {
    const response = await openaiClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a chat assistant. Suggest 3 short replies to the user's message.",
        },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 60,
    });

    const raw = response.choices[0].message.content;
    // Split suggestions by newline, filter empty strings
    const suggestions = raw
      .split("\n")
      .map((s) => s.replace(/^- /, "").trim())
      .filter(Boolean);

    res.json({ suggestions });
  } catch (err) {
    console.error("Smart Reply error:", err);
    res.status(500).json({ suggestions: [] });
  }
});

export default router;
