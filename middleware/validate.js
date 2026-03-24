/**
 * Middleware de validation pour la route /diagnose
 * Vérifie que les données envoyées par le client sont complètes et sûres.
 */

const LANGUES_ACCEPTEES = ["fr", "mg"];

const CHAMPS_REQUIS = ["symptoms", "age", "gender", "langue"];

function validateDiagnose(req, res, next) {
  const { symptoms, age, gender, langue } = req.body;

  // ── Vérification des champs requis ──────────────────────────────────────────
  for (const champ of CHAMPS_REQUIS) {
    if (!req.body[champ] && req.body[champ] !== 0) {
      return res.status(400).json({
        success: false,
        error: `Le champ "${champ}" est requis.`,
      });
    }
  }

  // ── Validation des symptômes ─────────────────────────────────────────────────
  if (typeof symptoms !== "string") {
    return res
      .status(400)
      .json({ success: false, error: "Les symptômes doivent être du texte." });
  }

  const symptomsTrimmed = symptoms.trim();
  if (symptomsTrimmed.length < 10) {
    return res.status(400).json({
      success: false,
      error: "Décrivez vos symptômes en au moins 10 caractères.",
    });
  }
  if (symptomsTrimmed.length > 1000) {
    return res.status(400).json({
      success: false,
      error: "La description ne doit pas dépasser 1000 caractères.",
    });
  }

  // ── Validation de l'âge ──────────────────────────────────────────────────────
  const ageNum = Number(age);
  if (!Number.isInteger(ageNum) || ageNum < 0 || ageNum > 120) {
    return res
      .status(400)
      .json({ success: false, error: "L'âge doit être un nombre entre 0 et 120." });
  }

  // ── Validation du sexe ───────────────────────────────────────────────────────
  if (!["homme", "femme", "autre"].includes(gender)) {
    return res.status(400).json({
      success: false,
      error: 'Le genre doit être "homme", "femme" ou "autre".',
    });
  }

  // ── Validation de la langue ──────────────────────────────────────────────────
  if (!LANGUES_ACCEPTEES.includes(langue)) {
    return res.status(400).json({
      success: false,
      error: 'La langue doit être "fr" (français) ou "mg" (malagasy).',
    });
  }

  // ── Nettoyage et passage au prochain middleware ──────────────────────────────
  req.body.symptoms = symptomsTrimmed;
  req.body.age = ageNum;

  next();
}

module.exports = { validateDiagnose };