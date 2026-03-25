require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const diagnoseRouter = require("./routes/diagnose");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Sécurité ─────────────────────────────────────────────────────────────────
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// Limite : 20 requêtes par minute par IP (important pour l'API Claude)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: "Trop de requêtes. Veuillez patienter une minute.",
  },
});

// ─── Middlewares globaux ───────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use("/api", limiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api", diagnoseRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "MediAssist API", version: "1.0.0" });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route introuvable." });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error("[ERROR]", err.message);
  res.status(err.status || 500).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Erreur interne du serveur."
        : err.message,
  });
});

// ─── Démarrage ────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏥 MediAssist Server lancé sur http://localhost:${PORT}`);
  console.log(`📋 Health check : http://localhost:${PORT}/health`);
  console.log(`🌍 Env : ${process.env.NODE_ENV || "development"}\n`);
});