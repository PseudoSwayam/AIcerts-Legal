function safeJsonParse(text) {
  if (!text || typeof text !== "string") {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (_err) {
    // continue to extraction path
  }

  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    try {
      return JSON.parse(objectMatch[0]);
    } catch (_err) {
      // continue
    }
  }

  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0]);
    } catch (_err) {
      // continue
    }
  }

  return null;
}

function normalizeRisk(value) {
  const v = String(value || "").trim().toLowerCase();
  if (v === "high" || v === "medium" || v === "low") {
    return v;
  }
  if (v.includes("high")) return "high";
  if (v.includes("med")) return "medium";
  return "low";
}

module.exports = { safeJsonParse, normalizeRisk };
