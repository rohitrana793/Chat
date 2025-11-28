import { ai } from "../app.js";

export async function checkToxicity(message) {
  try {
    const prompt = `
You are a content moderation assistant.

Classify the following message into one of these categories:

1. SAFE – No harmful intent.
2. MILD_TOXIC – Minor insults, rude language, light aggression. Allow these.
3. SEVERE_TOXIC – Hate speech, threats, slurs, extreme harassment. BLOCK these.

Message: "${message}"

Return ONLY valid JSON like:
{
  "label": "SAFE" or "MILD_TOXIC" or "SEVERE_TOXIC",
  "reason": "explanation here"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let text = response.text.trim();

    if (text.startsWith("```") && text.endsWith("```")) {
      text = text
        .replace(/^```.*\n?/, "")
        .replace(/```$/, "")
        .trim();
    }

    let json;
    try {
      json = JSON.parse(text);
    } catch (err) {
      console.warn("Gemini returned invalid JSON, defaulting to SAFE:", text);
      return { isToxic: false, severity: "safe", reason: "JSON parse failed" };
    }

    const label = (json.label || "").toUpperCase();

    if (label === "SEVERE_TOXIC") {
      return { isToxic: true, severity: "severe", reason: json.reason };
    }

    if (label === "MILD_TOXIC") {
      return { isToxic: false, severity: "mild", reason: json.reason };
    }

    return { isToxic: false, severity: "safe", reason: json.reason };
  } catch (err) {
    console.error("Gemini Error:", err);
    return { isToxic: false, severity: "safe", reason: "AI error" };
  }
}

/*
import { ai } from "../app.js";

export async function checkToxicity(message) {
  try {
    const prompt = `
You are a content moderation assistant.
Classify the following message strictly as TOXIC or SAFE.
Message: "${message}"
Return only JSON like { "label": "TOXIC" or "SAFE", "reason": "..." }
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let text = response.text.trim();

    // Strip code blocks if present
    if (text.startsWith("```") && text.endsWith("```")) {
      text = text
        .replace(/^```.*\n?/, "")
        .replace(/```$/, "")
        .trim();
    }

    let json;
    try {
      json = JSON.parse(text);
    } catch (err) {
      console.warn("Gemini returned invalid JSON, defaulting to SAFE:", text);
      return { isToxic: false, reason: "Safe by default (parsing failed)" };
    }

    const label = (json.label || "").toUpperCase();
    if (label === "TOXIC") {
      return { isToxic: true, reason: json.reason || "Contains toxic content" };
    } else {
      return { isToxic: false, reason: json.reason || "Message is safe" };
    }
  } catch (err) {
    console.error("Gemini Error:", err);
    return { isToxic: false, reason: "Safe by default (AI error)" };
  }
}

*/
