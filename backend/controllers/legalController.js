const { callAI } = require("../services/aiService");
const { safeJsonParse, normalizeRisk } = require("../utils/responseParser");

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

async function generateContract(req, res, next) {
  try {
    const { type, contractType, jurisdiction, parties, details, description } = req.body || {};

    const resolvedType = (type || contractType || "Contract").trim();
    const resolvedJurisdiction = (jurisdiction || "Unspecified jurisdiction").trim();
    const resolvedParties = (parties || "").trim();
    const resolvedDetails = (details || description || "").trim();
    const splitParties = resolvedParties
      ? resolvedParties.split(/\s+(?:and|&)\s+/i).map((item) => item.trim()).filter(Boolean)
      : [];
    const partyA = splitParties[0] || "Party A";
    const partyB = splitParties[1] || "Party B";

    const prompt = `Draft a concise, execution-ready ${resolvedType}.

  Input:
  - Jurisdiction: ${resolvedJurisdiction}
  - Party A name: ${partyA}
  - Party B name: ${partyB}
  - Deal context: ${resolvedDetails || "Not provided"}

  Strict drafting rules:
  1) Output Markdown only.
  2) Keep length between 380 and 520 words.
  3) Use these headings exactly and in order:
     - # NON-DISCLOSURE AGREEMENT
     - ## Parties
     - ## Purpose
     - ## Definitions
     - ## Obligations
     - ## Exclusions
     - ## Return or Destruction of Information
     - ## Liability
     - ## Term and Termination
     - ## Governing Law and Jurisdiction
     - ## Signatures
  4) Each heading must be on its own line; do not merge headings and body text on one line.
  5) Do NOT use placeholders of any kind: no square brackets, no underscores, no "TBD".
    6) Use the exact party names provided above in the Parties section and Signatures section.
      If missing, use only: "Party A", "Party B", "Address on record", and "Effective date: date of last signature".
  7) Governing law and jurisdiction must match exactly: ${resolvedJurisdiction}. Do not default to Delaware or any US state unless the jurisdiction is explicitly Delaware.
  8) Keep obligations balanced for both parties and include survival of confidentiality obligations.
    9) In ## Signatures include BOTH blocks in this exact format with blank lines preserved:
      **<Party Name>**
      Signature:

      Name:

      Title:

      Date:
    10) End with exactly one final line: Not legal advice.`;

    const ai = await callAI(prompt, {
      maxTokens: 520,
      temperature: 0.05,
      requestLabel: "generate",
    });

    return res.status(200).json({
      contract: ai.content,
      model: ai.modelUsed,
    });
  } catch (error) {
    return next(error);
  }
}

async function analyzeContract(req, res, next) {
  try {
    const { text } = req.body || {};
    if (!text || typeof text !== "string") {
      throw badRequest("'text' is required for analysis");
    }

    const trimmedText = text.slice(0, 12000);

    const prompt = `Analyze this contract and return ONLY valid JSON.

Required JSON format:
{
  "clauses": [
    {
      "title": "Clause title",
      "text": "Short excerpt or summary",
      "risk": "low|medium|high",
      "explanation": "Why this risk level",
      "suggestion": "How to improve"
    }
  ]
}

Return 5-10 clauses only.

Contract text:
${trimmedText}`;

    const ai = await callAI(prompt, {
      maxTokens: 420,
      temperature: 0.05,
      requestLabel: "analyze",
    });
    const parsed = safeJsonParse(ai.content);

    const clauses = Array.isArray(parsed?.clauses)
      ? parsed.clauses.map((item, index) => ({
          id: `cl-${index + 1}`,
          title: item?.title || `Clause ${index + 1}`,
          text: item?.text || "",
          risk: normalizeRisk(item?.risk),
          explanation: item?.explanation || "No explanation provided",
          suggestion: item?.suggestion || "",
        }))
      : [
          {
            id: "cl-1",
            title: "Contract Overview",
            text: "AI response could not be parsed into structured clauses.",
            risk: "medium",
            explanation: ai.content,
            suggestion: "Retry analysis with cleaner contract text.",
          },
        ];

    return res.status(200).json({ clauses, model: ai.modelUsed });
  } catch (error) {
    return next(error);
  }
}

async function detectRisk(req, res, next) {
  try {
    const { text } = req.body || {};
    if (!text || typeof text !== "string") {
      throw badRequest("'text' is required for risk detection");
    }

    const trimmedText = text.slice(0, 8000);

    const prompt = `Analyze this text and return:

- Risk Level: LOW / MEDIUM / HIGH
- Reason
- Suggested Fix

Return ONLY valid JSON in this exact format:
{
  "risks": [
    {
      "clause": "excerpt",
      "riskLevel": "LOW|MEDIUM|HIGH",
      "reason": "why",
      "suggestedFix": "fix"
    }
  ]
}

Text:
${trimmedText}`;

    const ai = await callAI(prompt, {
      maxTokens: 360,
      temperature: 0.05,
      requestLabel: "risk",
    });
    const parsed = safeJsonParse(ai.content);

    const risks = Array.isArray(parsed?.risks)
      ? parsed.risks.map((item) => ({
          clause: item?.clause || "Clause",
          riskLevel: String(item?.riskLevel || "MEDIUM").toUpperCase(),
          reason: item?.reason || "No reason provided",
          suggestedFix: item?.suggestedFix || "No suggestion provided",
        }))
      : [
          {
            clause: "Clause",
            riskLevel: "MEDIUM",
            reason: ai.content,
            suggestedFix: "Retry with clearer clause text.",
          },
        ];

    return res.status(200).json({ risks, model: ai.modelUsed });
  } catch (error) {
    return next(error);
  }
}

async function redlineClause(req, res, next) {
  try {
    const { text } = req.body || {};
    if (!text || typeof text !== "string") {
      throw badRequest("'text' is required for redlining");
    }

    const prompt = `Rewrite this legal clause to be fair, balanced, and concise.

Return:
- Improved clause
- Explanation

Return ONLY valid JSON in this format:
{
  "improvedClause": "...",
  "explanation": "..."
}

Clause:
${text.slice(0, 5000)}`;

    const ai = await callAI(prompt, {
      maxTokens: 300,
      temperature: 0.05,
      requestLabel: "redline",
    });
    const parsed = safeJsonParse(ai.content);

    return res.status(200).json({
      improvedClause: parsed?.improvedClause || ai.content,
      explanation: parsed?.explanation || "No explanation provided",
      model: ai.modelUsed,
    });
  } catch (error) {
    return next(error);
  }
}

async function askDocumentQuestion(req, res, next) {
  try {
    const { text, question } = req.body || {};

    if (!text || typeof text !== "string") {
      throw badRequest("'text' is required for document Q&A");
    }
    if (!question || typeof question !== "string") {
      throw badRequest("'question' is required for document Q&A");
    }

    const prompt = `Answer the question based ONLY on the provided contract.

Also include exact quote from document.

Return ONLY valid JSON in this format:
{
  "answer": "...",
  "quote": "..."
}

Contract:
${text.slice(0, 12000)}

Question:
${question}`;

    const ai = await callAI(prompt, {
      maxTokens: 300,
      temperature: 0.05,
      requestLabel: "ask",
    });
    const parsed = safeJsonParse(ai.content);

    return res.status(200).json({
      answer: parsed?.answer || ai.content,
      quote: parsed?.quote || "",
      model: ai.modelUsed,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  generateContract,
  analyzeContract,
  detectRisk,
  redlineClause,
  askDocumentQuestion,
};
