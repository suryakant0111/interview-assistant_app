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

// lib/geminiApi.js
export async function fetchGeminiSuggestion(prompt) {

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function fetchGeminiQuestions(jobDescription) {
  const prompt = `Given the following job description, list 5 of the most commonly asked interview questions for this role. Return only the questions, each on a new line.\n\nJob Description:\n${jobDescription}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  // Split by newlines and filter out empty lines
  return text.split(/\n+/).map(q => q.trim()).filter(Boolean);
}

export async function analyzeResume(formData) {
  // Get the file from FormData
  const file = formData.get('resume');
  if (!file) return '';

  // Only support .txt for now
  if (file.type !== 'text/plain') {
    return 'Resume analysis is currently only supported for .txt files.';
  }

  // Read the file as text
  const text = await file.text();
  const prompt = `Summarize the following resume in 3-4 sentences, focusing on key skills, experience, and strengths.\n\n${text}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No summary returned.';
}