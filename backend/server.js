const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const legalRoutes = require("./routes/legalRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const configuredOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow same-origin/server-to-server/no-origin calls (curl, Postman, health checks)
    if (!origin) return callback(null, true);

    // If not configured, allow all origins for easier first deployment
    if (configuredOrigins.length === 0) return callback(null, true);

    if (configuredOrigins.includes(origin)) return callback(null, true);

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, service: "legal-tool-backend" });
});

app.use("/api", legalRoutes);

app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend server running on http://localhost:${PORT}`);
});
