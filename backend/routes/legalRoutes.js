const express = require("express");
const {
  generateContract,
  analyzeContract,
  detectRisk,
  redlineClause,
  askDocumentQuestion,
} = require("../controllers/legalController");

const router = express.Router();

router.post("/generate", generateContract);
router.post("/analyze", analyzeContract);
router.post("/risk", detectRisk);
router.post("/redline", redlineClause);
router.post("/ask", askDocumentQuestion);

module.exports = router;
