import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(express.json());

// --- servir frontend ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "AI Chat Backend",
    api: "Advice API"
  });
});

// Healthcheck
app.get("/health", (_req, res) => {
  res.json({ ok: true, api: "Advice API" });
});

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
      error: "Error consultando Advice API"
    });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Servidor activo en puerto ${port}`);
});