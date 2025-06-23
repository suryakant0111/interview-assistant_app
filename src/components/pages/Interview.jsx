import React, { useState, useRef, useEffect } from 'react';
import { ResumeForm } from '../ResumeForm';
import { JobDescriptionForm } from '../JobDescriptionForm';
import { AnswerRenderer } from '../AnswerRenderer';
import SpeechController from '../speech/SpeechController';
import LiveSuggestionBox from '../suggestions/LiveSuggestionBox';
import { fetchGeminiAnswer, fetchGeminiSuggestion } from '../../lib/geminiApi';
import { Textarea } from '../Textarea';
import { Button } from '../Button';

export default function Interview() {
  const [question, setQuestion] = useState('');
  const [resume, setResume] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [position, setPosition] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  const inputRef = useRef(null);
  const chatEndRef = useRef(null);
  const suggestionDebounceRef = useRef(null);

  const handleSubmit = async () => {
    if (!question.trim()) return;
    setLoading(true);

    const previousContext = chatHistory
      .map((entry, idx) => `Q${idx + 1}: ${entry.question}\nA${idx + 1}: ${entry.answer}`)
      .join('\n\n');

    const fullPrompt = `You are acting as a highly prepared job candidate in a final round interview for the role of ${position || '[POSITION]'}.

🎯 Your goal is to answer the interviewer's question naturally, confidently, and fluently — just like a top-tier human candidate would. The user will read or speak this answer directly, so it should be easy to say aloud.

📌 Base your response on the following:

📄 RESUME:
"""
${resume}
"""

🧾 JOB DESCRIPTION:
"""
${jobDesc}
"""

🗂️ CONVERSATION HISTORY:
"""
${previousContext}
"""

🆕 NEW QUESTION:
"${question}"

🗣️ How to Answer:
- Speak like a real human — clear, friendly, and confident.
- Avoid robotic phrasing or repeating the question.
- Use contractions (“I’ve”, “I’m”, “it’s”) like in real speech.
- Structure naturally: a short intro → key points → closing remark.
- Use **bold text** (with double asterisks) for impactful phrases or values.
- Format any code snippets inside triple backticks (like \`\`\`js).

Now give the complete answer — ready to be spoken aloud.`;


    try {
      const response = await fetchGeminiAnswer(fullPrompt);
      setChatHistory((prev) => [...prev, { question, answer: response }]);
      setQuestion('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error fetching answer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionFetch = async (text) => {
    if (!text.trim() || text.length < 6) return;

    const suggestionPrompt = `You're an AI assistant that gives quick suggestions while a candidate is answering interview questions aloud.

Candidate said:
"${text}"

💡Give one short and helpful suggestion to improve their answer.`;

    setSuggestionLoading(true);
    try {
      const hint = await fetchGeminiSuggestion(suggestionPrompt);
      setSuggestion(hint);
    } catch (err) {
      console.error('Suggestion fetch failed:', err);
      setSuggestion('');
    } finally {
      setSuggestionLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const clearQuestion = () => {
    setQuestion('');
    setSuggestion('');
  };

  const handleTextUpdate = (text) => {
    setQuestion(text);
    clearTimeout(suggestionDebounceRef.current);
    suggestionDebounceRef.current = setTimeout(() => {
      handleSuggestionFetch(text);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="px-6 py-4 bg-indigo-600 text-white shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold text-center">Interview AI Assistant</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 md:px-8 max-w-6xl mx-auto mt-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <ResumeForm value={resume} onChange={(e) => setResume(e.target.value)} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <JobDescriptionForm value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} />
        </div>
      </div>

      <div className="px-4 md:px-8 max-w-4xl mx-auto mt-4">
        <input
          type="text"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          placeholder="Enter position/role (e.g., Software Engineer)"
          className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition"
          aria-label="Position or role"
        />
      </div>

      <main className="flex flex-col flex-grow max-w-4xl mx-auto w-full px-4 md:px-8 mt-4 mb-6">
        <div className="flex-grow overflow-y-auto bg-white rounded-lg shadow-md p-4 md:p-6" style={{ maxHeight: '60vh' }}>
          {chatHistory.length === 0 && (
            <p className="text-center text-gray-500 italic mt-12">
              Start by asking a question for the {position || '[POSITION]'} role.
            </p>
          )}
          {chatHistory.map((entry, idx) => (
            <div key={idx} className="mb-6 animate-slideFadeIn">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-indigo-600">👤 You:</span>
              </div>
              <div className="bg-indigo-50 text-gray-800 rounded-lg p-4 shadow-sm">
                {entry.question}
              </div>
              <div className="flex items-center gap-2 mt-4 mb-2">
                <span className="text-sm font-semibold text-green-600">🤖 Assistant:</span>
              </div>
              <div className="bg-green-50 text-gray-800 rounded-xl p-6 shadow-md whitespace-pre-wrap leading-relaxed prose prose-green max-w-none">
                <AnswerRenderer content={entry.answer} />
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 flex flex-col sm:flex-row items-center gap-4 mt-4">
          <div className="relative flex-grow w-full">
            <Textarea
              ref={inputRef}
              value={question}
              onChange={(e) => handleTextUpdate(e.target.value)}
              placeholder={`Ask your interview question for the ${position || '[POSITION]'} role...`}
              className="min-h-[100px] pr-12 resize-none rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition w-full"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!loading) handleSubmit();
                }
              }}
              disabled={loading}
              aria-label="Interview question input"
            />
            {question && (
              <button
                onClick={clearQuestion}
                className="absolute top-3 right-3 text-gray-400 hover:text-indigo-600 transition-transform hover:scale-110"
                title="Clear input"
                aria-label="Clear question input"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
                      <LiveSuggestionBox suggestion={suggestion} isLoading={suggestionLoading} />


          <div className="flex flex-wrap gap-3 justify-end w-full sm:w-auto items-center">
            <SpeechController onTextUpdate={handleTextUpdate}  />
            <Button
              onClick={handleSubmit}
              disabled={loading || !question.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-transform hover:scale-105 active:scale-95"
              aria-label="Submit question"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              Ask
            </Button>
            <Button
              onClick={() => setChatHistory([])}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition-transform hover:scale-105 active:scale-95"
              disabled={loading}
              aria-label="Clear chat history"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear
            </Button>
          </div>
        </div>

        {loading && (
          <p className="text-center text-indigo-600 font-medium mt-2 flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span> Thinking...
          </p>
        )}
      </main>
    </div>
  );
}
