const express = require("express");
const router = express.Router();
const { validateDiagnose } = require("../middleware/validate");
const { analyzeSymptoms } = require("../services/aiService");

/**
 * POST /api/diagnose
 * Corps attendu :
 * {
 *   symptoms: string,   - Description des symptômes
 *   age: number,        - Âge du patient
 *   gender: string,     - "homme" | "femme" | "autre"
 *   langue: string      - "fr" | "mg"
 * }
 */
router.post("/diagnose", validateDiagnose, async (req, res, next) => {
  const { symptoms, age, gender, langue } = req.body;

  console.log(
    `[DIAGNOSE] Nouvelle analyse - Âge: ${age}, Genre: ${gender}, Langue: ${langue}`
  );

  try {
    const result = await analyzeSymptoms(symptoms, age, gender, langue);

    console.log(`[DIAGNOSE] Triage résultat : ${result.triage}`);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    // Erreur de parsing JSON (Claude n'a pas retourné un JSON valide)
    if (error instanceof SyntaxError) {
      console.error("[DIAGNOSE] Erreur parsing JSON Claude:", error.message);
      return res.status(502).json({
        success: false,
        error:
          "La réponse de l'assistant médical était invalide. Réessayez.",
      });
    }

    // Erreur API Anthropic (quota, clé invalide, timeout...)
    if (error?.status) {
      console.error(
        `[DIAGNOSE] Erreur API Gemini (${error.status}):`,
         error.message
        );
      const messages = {
        401: "Clé API invalide. Contactez l'administrateur.",
        429: "Trop de demandes. Veuillez patienter quelques secondes.",
        500: "Service IA temporairement indisponible. Réessayez dans un moment.",
      };
      return res.status(error.status).json({
        success: false,
        error: messages[error.status] || "Erreur du service IA.",
      });
    }

    next(error);
  }
});

/**
 * GET /api/diagnose/ping
 * Vérifie que la route fonctionne et que la clé API est configurée.
 */
router.get("/diagnose/ping", (req, res) => {
  const apiKeySet = !!process.env.GEMINI_API_KEY;
  res.json({
    success: true,
    message: "Route /diagnose opérationnelle",
    apiKeyConfigured: apiKeySet,
  });
});

module.exports = router;