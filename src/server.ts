import express from "express";
import type { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs/promises";
import { join,dirname } from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch"; // make sure to install node-fetch@3

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Express setup
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Folder containing your prompts
const promptsDir = join(__dirname, "../public/project-prompts");

// ----------------- Endpoint: List prompts -----------------
app.get("/api/ai/prompts", async (req: Request, res: Response) => {
  try {
    const files = await fs.readdir(promptsDir);
    const mdFiles = files.filter(f => f.endsWith(".md"));
    res.json(mdFiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to read prompts folder" });
  }
});

// ----------------- Endpoint: Execute prompt -----------------
app.post("/api/ai/execute", async (req: Request<{}, {}, { prompt?: string }>, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!prompt) return res.status(400).json({ error: "Prompt is required" });
    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "";
    res.json({ result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to execute prompt" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Prompts folder: ${promptsDir}`);
});