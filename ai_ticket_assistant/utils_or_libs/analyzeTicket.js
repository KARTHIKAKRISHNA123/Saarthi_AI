import axios from "axios";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export default async function analyzeTicket(ticket) {
  try {
    const prompt = `
You are an expert AI assistant that processes technical support tickets. 

Your job is to:
1. Summarize the issue.
2. Estimate its priority.
3. Provide helpful notes and resource links for human moderators.
4. List relevant technical skills required.

IMPORTANT:
- Respond with *only* valid raw JSON.
- Do NOT include markdown, code fences, comments, or any extra formatting.
- The format must be a raw JSON object.

Output format:
{
  "summary": "Short summary of the issue",
  "priority": "low" | "medium" | "high",
  "helpfulNotes": "Technical explanation with tips and links",
  "relatedSkills": ["string", "string"]
}

Ticket Title: ${ticket.title}
Description: ${ticket.description}
    `.trim();

    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const text =
      response?.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      console.error("⚠️ Empty response from Gemini AI");
      return null;
    }

    const cleaned = text.replace(/```json|```/g, "").trim();

    try {
      return JSON.parse(cleaned);
    } catch (err) {
      console.error("❌ Failed to parse AI response as JSON:", err.message);
      console.log("📦 Raw AI Output:\n", text);
      return null;
    }
  } catch (error) {
    console.error("❌ AI Ticket Analysis Error:", error.message);
    if (error.response?.data) {
      console.log("🔎 Gemini API error:", error.response.data);
    }
    return null;
  }
}
