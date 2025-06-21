import React, { useState, useRef, useEffect } from 'react';
import { ResumeForm } from '../ResumeForm';
import { JobDescriptionForm } from '../JobDescriptionForm';
import { AnswerRenderer } from '../AnswerRenderer';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { fetchGeminiAnswer } from '../../lib/geminiApi';
import { Textarea } from '../Textarea';
import { Button } from '../Button';

export default function Interview() {
  const [question, setQuestion] = useState('');
  const [resume, setResume] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef(null);
  const chatEndRef = useRef(null);

  const { startListening, stopListening, isListening } = useSpeechRecognition(setQuestion);

  const handleSubmit = async () => {
    if (!question.trim()) return;
    setLoading(true);

    const previousContext = chatHistory
      .map((entry, idx) => `Q${idx + 1}: ${entry.question}\nA${idx + 1}: ${entry.answer}`)
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

    try {
      const response = await fetchGeminiAnswer(fullPrompt);
      setChatHistory((prev) => [...prev, { question, answer: response }]);
      setQuestion('');
      inputRef.current?.focus();
    } catch (error) {
      console.error("Error fetching answer:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const clearQuestion = () => setQuestion('');

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900 font-sans">
      {/* Header */}
      <header className="px-6 py-8 text-center drop-shadow-lg">
        <h1 className="text-4xl font-extrabold text-indigo-700 tracking-wide select-none">
          Interview AI Assistant
        </h1>
      </header>

      {/* Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6 max-w-6xl mx-auto mb-8">
        <ResumeForm value={resume} onChange={(e) => setResume(e.target.value)} />
        <JobDescriptionForm value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} />
      </div>

      {/* Chat container */}
      <main className="flex flex-col flex-grow max-w-4xl mx-auto w-full px-6">
        {/* Chat history */}
        <div
          className="flex-grow overflow-y-auto bg-white rounded-2xl shadow-xl p-6 mb-6"
          style={{ maxHeight: '65vh' }}
        >
          {chatHistory.length === 0 && (
            <p className="text-center text-gray-400 italic mt-16 select-none">
              Start by asking a question above.
            </p>
          )}
          {chatHistory.map((entry, idx) => (
            <div
              key={idx}
              className={`mb-8 animate-slideFadeIn`}
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <div className="mb-1 text-sm font-semibold text-indigo-600 flex items-center gap-2 select-none">
                <span>👤 You:</span>
              </div>
              <div className="mb-3 whitespace-pre-wrap text-gray-800 bg-indigo-50 rounded-lg p-4 shadow-md max-w-full">
                {entry.question}
              </div>

              <div className="mb-1 text-sm font-semibold text-green-700 flex items-center gap-2 select-none">
                <span>🤖 Assistant:</span>
              </div>
              <div className="whitespace-pre-wrap bg-green-50 rounded-lg p-5 shadow-md max-w-full border border-green-200">
                <AnswerRenderer content={entry.answer} />
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input and controls */}
        <div className="bg-white rounded-2xl shadow-xl p-5 flex flex-col sm:flex-row items-center gap-4 relative">
          <div className="relative flex-grow w-full">
            <Textarea
              ref={inputRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask your interview question..."
              className="min-h-[90px] pr-12 resize-none rounded-xl border border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!loading) handleSubmit();
                }
              }}
              disabled={loading}
            />
            {question && (
              <button
                onClick={clearQuestion}
                type="button"
                aria-label="Clear input"
                className="absolute top-3 right-3 text-indigo-400 hover:text-indigo-700 transition-transform hover:scale-125 focus:outline-none"
                title="Clear input"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3 justify-end w-full sm:w-auto">
            <Button
              onClick={startListening}
              disabled={isListening || loading}
              className="transform transition hover:scale-105 active:scale-95"
            >
              🎤 {isListening ? 'Listening...' : 'Start Listening'}
            </Button>
            {isListening && (
              <Button
                onClick={stopListening}
                disabled={loading}
                className="transform transition hover:scale-105 active:scale-95"
              >
                🛑 Stop
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={loading || !question.trim()}
              className="transform transition hover:scale-105 active:scale-95"
            >
              ✉️ Ask
            </Button>
            <Button
              onClick={() => setChatHistory([])}
              className="bg-red-600 hover:bg-red-700 text-white transform transition hover:scale-105 active:scale-95"
              disabled={loading}
            >
              🗑️ Clear Chat
            </Button>
          </div>
        </div>

        {loading && (
          <p className="text-center text-indigo-600 font-semibold mt-3 animate-pulse select-none">
            Thinking...
          </p>
        )}
      </main>

      {/* Animations */}
      <style jsx>{`
        @keyframes slideFadeIn {
          0% {
            opacity: 0;
            transform: translateY(15px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideFadeIn {
          animation: slideFadeIn 0.4s ease forwards;
        }
      `}</style>
    </div>
  );
}
