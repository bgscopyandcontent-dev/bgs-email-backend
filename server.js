import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

// Groq API endpoint
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Generate email
app.post("/api/generate-email", async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: [
          {
            role: "system",
            content: "You are a helpful, expert cold email copywriter.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Groq error:", text);
      return res.status(500).json({ error: "Email generation failed." });
    }

    const data = await response.json();
    const email =
      data.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I couldn't generate an email.";

    res.json({ email });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error while generating email." });
  }
});

// Feedback endpoint
app.post("/api/feedback", (req, res) => {
  const { feedback, payload, email } = req.body;
  console.log("Feedback received:", { feedback, payload, email });
  res.json({ ok: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
