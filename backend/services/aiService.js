const axios = require("axios");

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODELS = [
  "google/gemini-2.0-flash-lite-preview-02-05:free",
  "mistralai/mistral-small-24b-instruct-2501:free",
  "meta-llama/llama-3.3-70b-instruct:free",
];

function extractContent(responseData) {
  const messageContent = responseData?.choices?.[0]?.message?.content;

  if (typeof messageContent === "string") {
    return messageContent.trim();
  }

  if (Array.isArray(messageContent)) {
    const text = messageContent
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part.text === "string") return part.text;
        return "";
      })
      .join("\n")
      .trim();
    if (text) return text;
  }

  // Some providers return text on alternate fields
  const altText =
    responseData?.choices?.[0]?.text ||
    responseData?.choices?.[0]?.message?.reasoning ||
    "";

  return typeof altText === "string" ? altText.trim() : "";
}

function extractErrorMessage(error) {
  return (
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    "Unknown error"
  );
}

async function callAI(prompt, options = {}) {
  if (!process.env.OPENROUTER_API_KEY) {
    const err = new Error("Missing OPENROUTER_API_KEY in environment variables");
    err.status = 500;
    throw err;
  }

  const temperature = typeof options.temperature === "number" ? options.temperature : 0.1;
  const maxTokens = typeof options.maxTokens === "number" ? options.maxTokens : 800;
  const requestLabel = options.requestLabel || "ai-request";

  const requestStart = Date.now();
  // eslint-disable-next-line no-console
  console.info(`[AI] start label=${requestLabel} maxTokens=${maxTokens} timeoutMs=none`);

  let lastError;

  for (const model of MODELS) {
    const modelStart = Date.now();
    try {
      const response = await axios.post(
        OPENROUTER_URL,
        {
          model,
          messages: [
            {
              role: "system",
              content: "You are a concise legal AI assistant. Return only what is asked.",
            },
            { role: "user", content: prompt },
          ],
          temperature,
          max_tokens: maxTokens,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const content = extractContent(response.data);
      if (!content) {
        throw new Error(`Model ${model} returned an empty response`);
      }

      // eslint-disable-next-line no-console
      console.info(
        `[AI] success label=${requestLabel} model=${model} elapsedMs=${Date.now() - modelStart} totalElapsedMs=${Date.now() - requestStart}`
      );

      return { content, modelUsed: model };
    } catch (error) {
      lastError = error;
      // eslint-disable-next-line no-console
      console.warn(
        `[AI] fail label=${requestLabel} model=${model} elapsedMs=${Date.now() - modelStart} error=${extractErrorMessage(error)}`
      );
    }
  }

  const status = lastError?.response?.status || 502;
  const message =
    lastError?.response?.data?.error?.message ||
    lastError?.message ||
    "OpenRouter request failed";

  const err = new Error(message);
  err.status = status;
  throw err;
}

module.exports = { callAI };
