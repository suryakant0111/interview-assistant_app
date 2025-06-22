import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  const [isChromeMobile, setIsChromeMobile] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const lastTranscriptRef = useRef(''); // Track last processed transcript

  const inputRef = useRef(null);
  const chatEndRef = useRef(null);

  // Stable callbacks
  const onResult = useCallback((transcript, isFinal) => {
    console.log('Raw transcript:', transcript, 'IsFinal:', isFinal);
    const sanitized = transcript
      .replace(/\b(?:HRBT|HBRT|H B R T|uhm|uh|ah|mm)\b/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    console.log('Sanitized transcript:', sanitized);

    // Only update if final or if interim is significantly different
    if (isFinal || (sanitized && sanitized !== lastTranscriptRef.current)) {
      setQuestion((prev) => {
        // Replace interim with final or append new transcript
        const newQuestion = isFinal ? sanitized : prev.trim() ? `${prev} ${sanitized}` : sanitized;
        console.log('Updated question:', newQuestion);
        lastTranscriptRef.current = sanitized;
        return newQuestion;
      });
      setSpeechError(null);
    } else {
      console.log('Skipped duplicate or empty transcript:', sanitized);
    }
  }, []);

  const onStart = useCallback(() => {
    console.log('🎙️ Speech recognition started in Interview.jsx at', new Date().toISOString());
    lastTranscriptRef.current = ''; // Reset transcript tracking
  }, []);

  const onEnd = useCallback(() => {
    console.log('🛑 Speech recognition stopped in Interview.jsx at', new Date().toISOString());
  }, []);

  const onError = useCallback((error) => {
    console.error('Speech recognition error in Interview.jsx:', error);
    setSpeechError(`Speech recognition error: ${error}. Please check microphone permissions and ensure no other app is using the microphone.`);
  }, []);

  // Detect Chrome on mobile
  useEffect(() => {
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent);
    setIsChromeMobile(isMobile && isChrome);
    console.log('isChromeMobile:', isMobile && isChrome);
  }, []);

  const { startListening, stopListening, isListening, isSupported } = useSpeechRecognition({
    onResult,
    autoRestart: false,
    onStart,
    onEnd,
    onError,
  });

  // Stop recognition on tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isListening) {
        console.log('Visibility change: stopping recognition');
        stopListening();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isListening, stopListening]);

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
      console.error('Error fetching answer:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const clearQuestion = () => {
    setQuestion('');
    lastTranscriptRef.current = '';
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900 font-sans">
      <header className="px-4 py-6 text-center drop-shadow-lg">
        <h1 className="text-3xl md:text-4xl font-extrabold text-indigo-700 tracking-wide select-none">
          Interview AI Assistant
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-6 max-w-6xl mx-auto mb-6">
        <ResumeForm value={resume} onChange={(e) => setResume(e.target.value)} />
        <JobDescriptionForm value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} />
      </div>

      <main className="flex flex-col flex-grow max-w-4xl mx-auto w-full px-4 md:px-6">
        <div
          className="flex-grow overflow-y-auto bg-white rounded-2xl shadow-xl p-4 md:p-6 mb-6"
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
              className="mb-8 animate-slideFadeIn"
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

        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-5 flex flex-col sm:flex-row items-center gap-4 relative w-full">
          <div className="relative flex-grow w-full">
            <Textarea
              ref={inputRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask your interview question..."
              className="min-h-[90px] pr-12 resize-none rounded-xl border border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition w-full"
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

          <div className="flex flex-wrap gap-3 justify-end w-full sm:w-auto items-center">
            <span
              className={`inline-block w-3 h-3 rounded-full mr-2 ${
                isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'
              }`}
              title={isListening ? 'Listening' : 'Not listening'}
            />
            <Button
              onClick={startListening}
              disabled={isListening || loading || !isSupported}
              className="transform transition hover:scale-105 active:scale-95"
            >
              🎤 Start
            </Button>
            {isListening && (
              <Button
                onClick={stopListening}
                disabled={loading}
                className="transform transition hover:scale-105 active:scale-95 bg-red-500 hover:bg-red-600"
              >
                🛑 Stop
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={loading || !question.trim()}
              className="transform transition hover:scale-105 active:scale-95 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              ✉️ Ask
            </Button>
            <Button
              onClick={() => setChatHistory([])}
              className="bg-red-600 hover:bg-red-700 text-white transform transition hover:scale-105 active:scale-95"
              disabled={loading}
            >
              🗑️ Clear
            </Button>
            <Button
              onClick={() => setQuestion('Test question from speech')}
              className="bg-yellow-500 hover:bg-yellow-600 text-white transform transition hover:scale-105 active:scale-95"
            >
              🧪 Test Speech
            </Button>
          </div>
        </div>

        <div className="text-sm text-gray-600 mt-2 text-center">
          Speech Recognition: {isSupported ? 'Supported' : 'Not Supported'} | Listening: {isListening.toString()}
        </div>
        {speechError && (
          <p className="text-center text-red-600 font-semibold mt-2">{speechError}</p>
        )}
        {loading && (
          <p className="text-center text-indigo-600 font-semibold mt-3 animate-pulse select-none">
            Thinking...
          </p>
        )}
      </main>

      <style>{`
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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}