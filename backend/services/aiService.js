const { GoogleGenAI } = require("@google/genai");

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const TRIAGE_LEVELS = {
  URGENCE: "urgence",
  CONSULTATION: "consultation",
  DOMICILE: "domicile",
};

const SYSTEM_PROMPTS = {
  fr: `Tu es MediAssist, un assistant médical bienveillant conçu spécialement pour Madagascar.
Ton rôle est d'analyser les symptômes décrits et de donner une recommandation claire sur la conduite à tenir.

RÈGLES IMPORTANTES :
- Tu n'es PAS un médecin et tu ne poses PAS de diagnostic définitif.
- En cas de doute, recommande TOUJOURS de consulter un professionnel de santé.
- Prends en compte le contexte médical de Madagascar (accès limité aux soins, maladies tropicales fréquentes comme le paludisme, la typhoïde, la dengue).
- Tes réponses doivent être simples, claires et compréhensibles par tous.
- Réponds UNIQUEMENT en JSON valide, sans texte avant ou après.

FORMAT DE RÉPONSE JSON OBLIGATOIRE :
{
  "triage": "urgence" | "consultation" | "domicile",
  "resume": "Résumé en 1-2 phrases de la situation",
  "conseils": ["conseil 1", "conseil 2", "conseil 3"],
  "signes_alarme": ["signe 1", "signe 2"],
  "quand_consulter": "Description claire de quand aller voir un médecin",
  "disclaimer": "Rappel que ceci n'est pas un avis médical professionnel"
}`,

  mg: `Ianao dia MediAssist, mpanolo-tsaina ara-pahasalamana nalaina ho an'i Madagasikara.
Ny asanao dia ny mianatra ny marary voalaza ary manome torohevitra mazava momba izay atao.

FITSIPIKA LEHIBE :
- Tsy dokotera ianao ary tsy manome diagnôzy mazava.
- Raha misy fisalasalana, asainao FOANA mba handeha any amin'ny dokotera.
- Saintsaino ny toe-pitsaboana any Madagasikara (palide, tazo, dengue, sns.).
- Ny valinteny dia tsy maintsy tsotra sy azon'ny rehetra.
- Valiny amin'ny JSON IHANY, tsy misy lahatsoratra aloha na aoriany.

ENDRIKA JSON ILAINA :
{
  "triage": "urgence" | "consultation" | "domicile",
  "resume": "Famintinana 1-2 fehezanteny momba ny toe-java-misy",
  "conseils": ["torohevitra 1", "torohevitra 2", "torohevitra 3"],
  "signes_alarme": ["famantarana 1", "famantarana 2"],
  "quand_consulter": "Fanazavana mazava hoe rahoviana no tokony handeha any amin'ny dokotera",
  "disclaimer": "Fahatsiarovana fa tsy hevitry ny dokotera matihanina izao"
}`,
};

function buildUserPrompt(symptoms, age, gender, langue) {
  if (langue === "mg") {
    return `Marary ny olona iray manana ireto marary ireto:

Taona: ${age} taona
Lahy/Vavy: ${gender}
Marary voalaza: ${symptoms}

Ekipo ny toe-javatra ary omeo valinteny amin'ny JSON voafaritra.`;
  }

  return `Un patient présente les symptômes suivants :

Âge : ${age} ans
Genre : ${gender}
Symptômes : ${symptoms}

Analyse la situation et réponds avec le JSON défini.`;
}

async function analyzeSymptoms(symptoms, age, gender, langue = "fr") {
  const systemPrompt = SYSTEM_PROMPTS[langue] || SYSTEM_PROMPTS.fr;
  const userPrompt = buildUserPrompt(symptoms, age, gender, langue);

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
      },
    ],
  });

  const rawText = response.text.trim();

  const cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  const triageValues = Object.values(TRIAGE_LEVELS);
  if (!triageValues.includes(parsed.triage)) {
    parsed.triage = TRIAGE_LEVELS.CONSULTATION;
  }

  return {
    ...parsed,
    meta: {
      langue,
      age,
      gender,
      analyzedAt: new Date().toISOString(),
      model: "gemini-2.5-flash", // ✅ corrigé ici
    },
  };
}

module.exports = { analyzeSymptoms, TRIAGE_LEVELS };