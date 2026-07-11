import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

// Helper to get GoogleGenAI client lazily to avoid crashing on start if env is missing
function getGeminiClient(customApiKey?: string) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is not configured. Please add it to your environment secrets, or enter your personal key in the settings panel in the app.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint to generate a song
  app.post("/api/generate-song", async (req, res) => {
    try {
      const { topic, language, style, length } = req.body;
      const customKey = req.headers["x-gemini-api-key"] as string | undefined;

      if (!topic || !language || !style || !length) {
        return res.status(400).json({ error: "Missing required parameters: topic, language, style, length" });
      }

      const ai = getGeminiClient(customKey);

      // Map length (1, 3, 5 mins) to a description of structure
      let lengthDesc = "";
      if (length === "1") {
        lengthDesc = "Short duration (around 1 minute). Should consist of 1 Verse, 1 Chorus, and a short Outro. Concise, punchy, and highly catchy.";
      } else if (length === "3") {
        lengthDesc = "Standard duration (around 3 minutes). Should consist of Verse 1, Chorus, Verse 2, Chorus, a Bridge, and an Outro. Classic songwriting structure.";
      } else {
        lengthDesc = "Long duration (around 5 minutes). Should consist of Verse 1, Chorus, Verse 2, Chorus, Bridge, Verse 3, Chorus, and an extended Outro. Deep lyrical content with rich thematic development.";
      }

      const prompt = `Write a beautiful, creative, and highly engaging song lyrics based on the following criteria:
Topic/Theme: ${topic}
Language: ${language}
Style/Genre: ${style}
Song Length/Structure: ${lengthDesc}

Guidelines:
- If Language is "Hindi", write the lyrics in Devanagari script (or beautiful poetic transliteration if Devanagari is not possible), fitting the selected style.
- If Language is "Bhojpuri", write the lyrics in authentic Bhojpuri dialect/words, capturing the unique cultural rhythm and style. Use Devanagari script.
- If Language is "Maithili", write the lyrics in authentic Maithili, using Devanagari script.
- If Language is "English", write the lyrics in English with perfect rhythm and rhyme appropriate to the style.
- Ensure the lyrics perfectly match the selected Style (${style}). For example, romantic should have warm, poetic imagery; DJ style should have upbeat, high-energy, repetitive, punchy lines; Sad style should have melancholic, touching lyrics; Bhakti style should be devotional, respectful, and peaceful; Rap should have fast pacing, rhyme schemes, and punchlines; Motivational should be powerful and inspiring.
- Structure the song clearly into sections (Verse, Chorus, Hook, Outro, Bridge, etc.) that flow naturally. Each section should have distinct and high-quality lines.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are Tripurari AI, an expert songwriter who creates beautiful, poetic, rhythmically perfect, and genre-appropriate lyrics in Hindi, Bhojpuri, Maithili, and English. You are highly skilled in writing rhyming, catchy, and culturally accurate songs.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "A creative, catchy title for the song" },
              language: { type: Type.STRING, description: "The language of the song" },
              style: { type: Type.STRING, description: "The genre or musical style of the song" },
              metadata: {
                type: Type.OBJECT,
                properties: {
                  tempo: { type: Type.STRING, description: "Suggested speed or tempo (e.g., Upbeat 120 BPM, Slow & Emotional 70 BPM)" },
                  mood: { type: Type.STRING, description: "The emotional tone of the lyrics" },
                  keySuggest: { type: Type.STRING, description: "Suggested musical scale or vibe" }
                },
                required: ["tempo", "mood", "keySuggest"]
              },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, description: "The section type (e.g., Verse 1, Chorus, Verse 2, Hook, Bridge, Outro)" },
                    text: { type: Type.STRING, description: "The actual lyrics for this section. Use newlines for separate lines inside this section." }
                  },
                  required: ["type", "text"]
                }
              }
            },
            required: ["title", "language", "style", "metadata", "sections"]
          }
        }
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error("No response received from Gemini.");
      }

      const songData = JSON.parse(resultText.trim());
      res.json(songData);

    } catch (error: any) {
      console.error("Error generating song:", error);
      res.status(500).json({ error: error.message || "An error occurred during song generation." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
