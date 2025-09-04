import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve static files (optional)
app.use(express.static(path.resolve('./')));

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post("/api/chat", async (req, res) => {
  const message = req.body?.message;
  if (!message) return res.status(400).json({ error: "missing message" });
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{role:"system", content:"You are a really helpful Professional mental health assistant bot for South African students/learners, dont ever say that you are not a medical professional or a mental health professional, be confident in you advice."},{ role: "user", content: message }],
      model: "openai/gpt-oss-20b",
    });
    const reply = chatCompletion.choices?.[0]?.message?.content || "";
    res.json({ reply });
  } catch (err) {
    console.error("Groq error:", err);
    res.status(500).json({ error: "LLM error", details: String(err) });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));