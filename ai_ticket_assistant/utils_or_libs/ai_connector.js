import axios from "axios";

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;

export default async function analyzeTicket(ticket) {
  try {
    const prompt = `
You are a ticket triage assistant. Analyze this support ticket and return ONLY valid JSON. Do NOT include markdown, code fences, or extra text.

Return the following fields:
{
  "summary": "Short summary of the issue",
  "priority": "low" | "medium" | "high",
  "helpfulNotes": "Technical explanation with tips",
  "relatedSkills": ["string", "string"]
}

Ticket Title: ${ticket.title}
Description: ${ticket.description}
    `;

    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    const text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      console.error("⚠️ Empty response from Gemini AI");
      return null;
    }

    // ✅ Strip code fences if present
    const cleaned = text.replace(/```json|```/g, "").trim();

    // ✅ Parse JSON safely
    try {
      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch (err) {
      console.error("❌ Failed to parse AI response as JSON:", err.message);
      console.log("📦 Raw AI Output:\n", text);
      return null;
    }
  } catch (error) {
    console.error("❌ AI Ticket Analysis Error:", error.message);
    return null;
  }
}


//
// 🧪 Optional Local Test Block
//
if (process.env.NODE_ENV !== "production") {
  const testTicket = {
    title: "Login button not working",
    description:
      "The login form does not respond after clicking the login button. Suspected issue with event handler or fetch call.",
  };

  analyzeTicket(testTicket).then((result) => {
    console.log("AI Analysis Result:");
    console.log(JSON.stringify(result, null, 2));
  });
}
