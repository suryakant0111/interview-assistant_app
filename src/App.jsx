// File: src/App.jsx
import React, { useState, useRef } from 'react';
import { Textarea } from './components/Textarea';
import { Button } from './components/Button';
import { ResumeForm } from './components/ResumeForm';
import { JobDescriptionForm } from './components/JobDescriptionForm';
import { AnswerRenderer } from './components/AnswerRenderer';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { fetchGeminiAnswer } from './lib/geminiApi';

export default function App() {
  const [question, setQuestion] = useState('');
  const [resume, setResume] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const { startListening, stopListening, isListening } = useSpeechRecognition(setQuestion);

  const handleSubmit = async () => {
    if (!question.trim()) return;
    setLoading(true);

    const previousContext = chatHistory
      .map(
        (entry, idx) => `Q${idx + 1}: ${entry.question}\nA${idx + 1}: ${entry.answer}`
      )
      .join('\n\n');

    const fullPrompt = `You are simulating a human interviewee. Use a confident, natural tone — like how a real candidate would answer in a final round interview.

Base your answer on the following:

RESUME:
"""
${resume}
"""

JOB DESCRIPTION:
"""
${jobDesc}
"""

CONVERSATION HISTORY:
"""
${previousContext}
"""

NEW QUESTION:
"${question}"

⛳️ Answer Format Guidelines:
- Be human and confident.
- Use **bold text** for key phrases using double asterisks (like **this**).
- Use bullet points or steps **only when necessary**, not always.
- If the answer includes code, format it using triple backticks like \`\`\`java.
- Avoid repeating the question or robotic phrases.

Respond naturally and clearly.`;

    const response = await fetchGeminiAnswer(fullPrompt);
    setChatHistory((prev) => [...prev, { question, answer: response }]);
    setQuestion('');
    inputRef.current?.focus();
    setLoading(false);
  };

  return (
    <div className="min-h-screen px-4 py-6 bg-gray-100 text-gray-900 flex flex-col items-center">
      <h1 className="text-3xl font-semibold mb-4">Interview AI Assistant</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mb-6">
        <ResumeForm value={resume} onChange={(e) => setResume(e.target.value)} />
        <JobDescriptionForm value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} />
      </div>

      <div className="w-full max-w-3xl mb-4">
        <Textarea
          ref={inputRef}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask your interview question..."
          className="min-h-[100px]"
        />
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <Button onClick={startListening} disabled={isListening}>
          🎤 {isListening ? 'Listening...' : 'Start Listening'}
        </Button>
        {isListening && (
          <Button onClick={stopListening}>
<<<<<<< HEAD
            🛑 Stop 
=======
            🛑 Stop
>>>>>>> 7ca83961531a8b622e16fbb6791daf1b7d763c2e
          </Button>
        )}
        <Button onClick={handleSubmit} disabled={loading}>
          ✉️ Ask
        </Button>
        <Button
          onClick={() => setChatHistory([])}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          🗑️ Clear Chat
        </Button>
      </div>

      {loading && <p className="text-sm text-gray-600 mb-6">Thinking...</p>}

      <div className="w-full max-w-3xl space-y-6">
        {chatHistory.map((entry, idx) => (
          <div key={idx} className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm font-semibold text-blue-700 mb-1">👤 You:</p>
            <p className="mb-2 text-gray-800 whitespace-pre-wrap">{entry.question}</p>
            <p className="text-sm font-semibold text-green-700 mb-1">🤖 Assistant:</p>
            <AnswerRenderer content={entry.answer} />
          </div>
        ))}
      </div>
    </div>
  );
}
