import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(express.json());

// --- servir archivos estáticos ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// --- Gemini ---
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ Falta GEMINI_API_KEY en .env");
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Healthcheck opcional
app.get("/health", (_req, res) => res.json({ ok: true, provider: "gemini" }));

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Falta message" });
  }

  try {
    const response = await fetch("https://api.adviceslip.com/advice");

    const data = await response.json();

    const advice = data.slip.advice;

    res.json({
      reply: `Consejo de la IA: ${advice}`
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error consultando la API de prueba"
    });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`✅ Abre http://localhost:${port}`));