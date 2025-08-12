// controllers/aiController.js
const { generateTemplate } = require("../service/aiService");
const { sendAIEmail } = require("../service/emailService");
const sanitize = require("../utils/sanitizeInput");
const logger = require("../utils/logger");

const KEY = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || "";
if (!KEY) throw new Error("Gemini API key missing (set GEMINI_API_KEY or OPENAI_API_KEY)");

let genAI = null;

// --- פונקציה ל-template (אם צריך) ---
const generate = async (req, res) => {
  try {
    const sanitized = sanitize(req.body);
    const templates = generateTemplate(sanitized, req.user?.role || "teacher");
    if (req.user?.email) {
      await sendAIEmail(req.user.email, "תבנית AI", templates.join("\n\n"));
    }
    res.status(200).json({ templates });
  } catch (err) {
    logger.error(`❌ Error generating AI template: ${err.message}`);
    res.status(500).json({ error: "שגיאת שרת ביצירת התבניות." });
  }
};

// --- פונקציית הצ'אט ---
const chat = async (req, res) => {
  try {
    const body = sanitize(req.body || {});
    const { question = "", lastParentMessage = "" } = body;

    const userText = String(question || lastParentMessage || "").trim();
    if (!userText) return res.status(400).json({ error: "נא לספק טקסט לשאלה/בקשה." });
    if (userText.length > 4000) return res.status(413).json({ error: "הטקסט ארוך מדי." });

    const systemPrompt =
      "את/ה עוזר/ת הוראה/מידע חכם/ה. ענה/י מיד בעברית פשוטה, קצרה וישירה, ללא פתיחים, נימוסים או בקשות מידע נוספות.";

    if (!genAI) {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      genAI = new GoogleGenerativeAI(KEY);
    }

    const model = genAI.getGenerativeModel({
      model: process.env.GOOGLE_MODEL || "gemini-1.5-flash",
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userText }]}],
      generationConfig: {
        maxOutputTokens: 1200,
        temperature: 1,
      },
    });

    const draft = result?.response?.text()?.trim() || "";
    if (!draft) return res.status(502).json({ error: "לא התקבלה תשובה מה-AI." });

    logger.info("✔️ AI free chat (Gemini) generated", { userId: req.user?.id || "unknown" });

    return res.json({ draft });
  } catch (err) {
    logger.error("❌ AI chat failed (Gemini)", { detail: err?.message || err });
    return res.status(500).json({ error: "שגיאת שרת בצ'אט ה-AI." });
  }
};

// --- ייצוא מסודר ---
module.exports = { generate, chat };
