import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Groq API details
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.post("/api/generate-email", async (req, res) => {
  const {
    yourName,
    yourRole,
    yourCompany,
    prospectName,
    prospectCompany,
    prospectRole,
    context,
    approach,
  } = req.body;

  if (!yourName || !yourRole || !prospectName || !prospectCompany || !approach) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const prompt = `
You are an expert cold email copywriter for freelancers.

Write a personalised cold outreach email for a freelancer.

Details:
- Freelancer name: ${yourName}
- Freelancer role/service: ${yourRole}
- Freelancer company/brand: ${yourCompany || "N/A"}
- Prospect name: ${prospectName}
- Prospect company: ${prospectCompany}
- Prospect role: ${prospectRole || "N/A"}
- Extra context: ${context || "No extra context provided."}
- Approach style: ${approach}

Requirements:
- Make the email feel tailored to this specific prospect.
- Use the chosen approach style in tone and structure.
- Keep it concise (120–180 words).
- Use a clear subject line.
- Avoid sounding generic or templated.
- Include a soft CTA.
Return only the email body including subject line.
`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "You are a helpful, expert cold email copywriter." },
          { role: "user", content: prompt },
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
    console.error(err);
    res.status(500).json({ error: "Server error while generating email." });
  }
});

app.post("/api/feedback", (req, res) => {
  const { feedback, payload, email } = req.body;
  console.log("Feedback received:", { feedback, payload, email });
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

