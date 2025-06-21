// File: src/lib/geminiApi.js
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function fetchGeminiAnswer(question) {
  const prompt = `Respond to this question as if you're in a real job interview. Be clear, concise, and professional:\n\n${question}`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No answer returned.';
}
