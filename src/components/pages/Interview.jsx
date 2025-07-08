import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { User, Bot, Mic, X, Send, Plus, Settings } from "lucide-react";
import SpeechController from "../speech/SpeechController";
import { ResumeForm } from "../ResumeForm";
import { JobDescriptionForm } from "../JobDescriptionForm";
import { AnswerRenderer } from "../AnswerRenderer";
import { fetchGeminiAnswer } from "../../lib/geminiApi";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";

export default function Interview() {
  const [question, setQuestion] = useState("");
  const [resume, setResume] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [position, setPosition] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const inputRef = useRef(null);
  const chatEndRef = useRef(null);
  const [showContext, setShowContext] = useState(true);
  const [mobileContextOpen, setMobileContextOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Resume/JD, 2: Interview

  // Add state for controlling mic
  const speechControllerRef = useRef();
  const handleMicClick = () => {
    if (speechControllerRef.current && speechControllerRef.current.toggleListening) {
      speechControllerRef.current.toggleListening();
    } else {
      alert('Mic feature coming soon!');
    }
  };
  const handlePlusClick = () => {
    alert('Add/attachment feature coming soon!');
  };
  const handleSettingsClick = () => {
    alert('Settings feature coming soon!');
  };

  const handleSubmit = async () => {
    if (!question.trim()) return;
    setLoading(true);
    const previousContext = chatHistory
      .map((entry, idx) => `Q${idx + 1}: ${entry.question}\nA${idx + 1}: ${entry.answer}`)
      .join("\n\n");
    const fullPrompt = `You are acting as a highly prepared job candidate in a final round interview for the role of ${position || '[POSITION]'}.\n\n${question}\n\nResume:\n${resume}\n\nJob Description:\n${jobDesc}\n\nConversation History:\n${previousContext}`;
    try {
      const response = await fetchGeminiAnswer(fullPrompt);
      setChatHistory((prev) => [...prev, { question, answer: response }]);
      setQuestion("");
      inputRef.current?.focus();
    } catch (error) {
      toast.error("Failed to get answer from AI.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const clearQuestion = () => setQuestion("");
  const handleTextUpdate = (text) => setQuestion(text);

  // Step 1: Resume & JD Entry
  if (step === 1) {
  return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{
          background: "#181a1b",
          fontFamily: "Arial, sans-serif",
          color: "#f8f9fa",
        }}
      >
        {/* Header */}
        <header
          style={{
            width: "100%",
            height: "60px",
            background: "#23272f",
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid #222c37",
            marginBottom: "32px",
            padding: "0 32px",
            borderRadius: "0 0 8px 8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}
        >
          <img
            src="/logo.png"
            alt="Solvinger Logo"
            style={{ height: 40, marginRight: 16 }}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: 22, color: "#4a90e2" }}>
              Solvinger
            </div>
            <div style={{ fontSize: 14, color: "#b0b8c1" }}>
              The AI Chat Bot (Community)
            </div>
          </div>
      </header>
        {/* Resume/JD Form */}
        <div
          style={{
            width: "100%",
            maxWidth: 480,
            background: "#23272f",
            borderRadius: 8,
            boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
            padding: 32,
            border: "1px solid #222c37",
          }}
        >
          <h2
            style={{
              fontWeight: 700,
              fontSize: 20,
              marginBottom: 24,
              textAlign: "center",
              color: "#4a90e2",
            }}
          >
            Interview Setup
          </h2>
          <div style={{ marginBottom: 20 }}>
            <label
              htmlFor="resume"
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: 8,
                color: "#f8f9fa",
              }}
            >
              Resume
            </label>
            <textarea
              id="resume"
              value={resume}
              onChange={e => setResume(e.target.value)}
              placeholder="Paste your resume here..."
              style={{
                width: "100%",
                minHeight: 80,
                borderRadius: 8,
                border: "1px solid #222c37",
                background: "#181a1b",
                color: "#f8f9fa",
                padding: 12,
                fontFamily: "Arial, sans-serif",
                fontSize: 15,
                marginBottom: 0,
                resize: "vertical",
              }}
            />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label
              htmlFor="jobdesc"
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: 8,
                color: "#f8f9fa",
              }}
            >
              Job Description
            </label>
            <textarea
              id="jobdesc"
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
              placeholder="Paste the job description here..."
              style={{
                width: "100%",
                minHeight: 80,
                borderRadius: 8,
                border: "1px solid #222c37",
                background: "#181a1b",
                color: "#f8f9fa",
                padding: 12,
                fontFamily: "Arial, sans-serif",
                fontSize: 15,
                marginBottom: 0,
                resize: "vertical",
              }}
            />
        </div>
          <button
            onClick={() => setStep(2)}
            disabled={!resume.trim() || !jobDesc.trim()}
            style={{
              width: "100%",
              height: 48,
              borderRadius: 8,
              background: "#007bff",
              color: "#fff",
              fontWeight: 700,
              fontSize: 17,
              border: "none",
              cursor: !resume.trim() || !jobDesc.trim() ? "not-allowed" : "pointer",
              opacity: !resume.trim() || !jobDesc.trim() ? 0.6 : 1,
              boxShadow: "0 2px 8px rgba(0,123,255,0.18)",
              transition: "background 0.2s",
            }}
          >
            Start Interview
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Interview Chat UI
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#181a1b", fontFamily: "Arial, sans-serif", color: "#f8f9fa" }}
    >
      {/* Header */}
      <header
        style={{
          width: "100%",
          height: "60px",
          background: "#23272f",
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid #222c37",
          padding: "0 32px",
          borderRadius: "0 0 8px 8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}
      >
        <img src="/logo.png" alt="Solvinger Logo" style={{ height: 40, marginRight: 16 }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 22, color: "#4a90e2" }}>Solvinger</div>
          <div style={{ fontSize: 14, color: "#b0b8c1" }}>The AI Chat Bot (Community)</div>
        </div>
      </header>
      {/* Main Chat Area - open, not boxed */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          padding: "24px 0 88px 0",
        }}
      >
        {/* Position input */}
        <input
          type="text"
          value={position}
          onChange={e => setPosition(e.target.value)}
          placeholder="Enter position/role (e.g., Software Engineer)"
          style={{
            width: "100%",
            maxWidth: 700,
            margin: "0 auto 14px auto",
            padding: "12px 14px",
            borderRadius: 8,
            border: "1px solid #222c37",
            background: "#181a1b",
            color: "#f8f9fa",
            fontSize: 15,
            outline: "none",
            display: "block",
            boxSizing: "border-box",
          }}
          aria-label="Position or role"
        />
        {/* Chat messages - free-flowing, ChatGPT-like, no extra divs */}
        <div
          style={{
            width: "100%",
            maxWidth: 700,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            flex: 1,
            minHeight: 250,
            padding: "0 8px",
            boxSizing: "border-box",
          }}
        >
          {chatHistory.length === 0 && (
            <p style={{ textAlign: "center", color: "#b0b8c1", fontStyle: "italic", marginTop: 24, fontSize: 15 }}>
              Start by asking a question for the {position || '[POSITION]'} role.
            </p>
          )}
          {chatHistory.map((entry, idx) => [
            // User message (right-aligned)
            <div key={`user-${idx}`} style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", gap: 6 }}>
              <div
                style={{
                  background: "#007bff",
                  color: "#fff",
                  borderRadius: 16,
                  padding: "12px 14px",
                  maxWidth: "90vw",
                  width: "fit-content",
                  fontWeight: 500,
                  fontSize: 15,
                  boxShadow: "0 2px 8px rgba(0,123,255,0.10)",
                  marginBottom: 1,
                  wordBreak: "break-word",
                }}
              >
                {entry.question}
              </div>
            </div>,
            // Bot message (left-aligned)
            <div key={`bot-${idx}`} style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-end", gap: 6, marginTop: 6 }}>
              <div
                style={{
                  background: "#232323",
                  color: "#f8f9fa",
                  borderRadius: 16,
                  padding: "12px 14px",
                  maxWidth: "90vw",
                  width: "fit-content",
                  fontSize: 15,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  marginBottom: 1,
                  wordBreak: "break-word",
                }}
              >
                {entry.answer ? <AnswerRenderer content={entry.answer} /> : <span style={{ color: "#4a90e2", fontStyle: "italic" }}>No answer returned.</span>}
              </div>
            </div>
          ])}
          {/* Loader while generating answer */}
          {loading && (
            <div style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 14,
              margin: "18px 0 18px 0",
              minHeight: 48,
              width: "100%",
              animation: "fadeInLoader 0.4s",
            }}>
              <span style={{
                display: "inline-block",
                width: 36,
                height: 36,
                position: "relative",
              }}>
                <span style={{
                  boxSizing: "border-box",
                  display: "block",
                  position: "absolute",
                  width: 36,
                  height: 36,
                  border: "4px solid #232c3b",
                  borderRadius: "50%",
                  borderTop: "4px solid #4a90e2",
                  borderRight: "4px solid #4a90e2",
                  animation: "spin 0.8s linear infinite",
                  boxShadow: "0 0 12px #4a90e2, 0 0 2px #232c3b",
                  left: 0,
                  top: 0,
                }} />
                <span style={{
                  boxSizing: "border-box",
                  display: "block",
                  position: "absolute",
                  width: 24,
                  height: 24,
                  left: 6,
                  top: 6,
                  border: "3px solid #232c3b",
                  borderRadius: "50%",
                  borderBottom: "3px solid #4a90e2",
                  borderLeft: "3px solid #4a90e2",
                  animation: "spinReverse 1.2s linear infinite",
                  boxShadow: "0 0 6px #4a90e2, 0 0 1px #232c3b",
                }} />
                <style>{`
                  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                  @keyframes spinReverse { 0% { transform: rotate(360deg); } 100% { transform: rotate(0deg); } }
                  @keyframes fadeInLoader { from { opacity: 0; } to { opacity: 1; } }
                `}</style>
              </span>
              <span style={{ color: "#b0b8c1", fontSize: 16, fontWeight: 500, fontFamily: 'Arial, sans-serif', letterSpacing: 0.2 }}>Generating answer…</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>
      {/* Floating Input Bar - modern Copilot/ChatGPT style with icons */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          background: "transparent",
          zIndex: 100,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 700,
            display: "flex",
            alignItems: "center",
            gap: 0,
            padding: "0 4px 16px 4px",
            pointerEvents: "auto",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              background: "#232323",
              borderRadius: 24,
              boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
              padding: "0 8px 0 4px",
              border: "1px solid #232c3b",
              minHeight: 44,
              maxWidth: "100vw",
            }}
          >
            {/* SpeechController (mic/stop/status) */}
            <div style={{ marginRight: 6 }}>
              <SpeechController onTextUpdate={handleTextUpdate} />
            </div>
            {/* Textarea */}
            <textarea
              ref={inputRef}
              value={question}
              onChange={e => handleTextUpdate(e.target.value)}
              placeholder={"Ask anything"}
              style={{
                minHeight: 36,
                maxHeight: 100,
                border: "none",
                outline: "none",
                background: "transparent",
                color: "#f8f9fa",
                fontSize: 15,
                fontFamily: "Arial, sans-serif",
                flex: 1,
                resize: "vertical",
                padding: "10px 0 10px 0",
                marginRight: 0,
                width: "100%",
                boxSizing: "border-box",
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!loading) handleSubmit();
                }
              }}
              disabled={loading}
              aria-label="Interview question input"
            />
            {/* Clear button */}
            {question && (
              <button
                onClick={clearQuestion}
                style={{
                  background: "none",
                  border: "none",
                  color: "#b0b8c1",
                  fontSize: 18,
                  marginLeft: 3,
                  marginRight: 3,
                  cursor: "pointer",
                  transition: "color 0.2s",
                }}
                aria-label="Clear question input"
                tabIndex={-1}
              >
                <X className="w-5 h-5" />
              </button>
            )}
            {/* Send button */}
            <button
              onClick={handleSubmit}
              disabled={loading || !question.trim()}
              style={{
                background: loading || !question.trim() ? "#232c3b" : "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: 36,
                height: 36,
                marginLeft: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                cursor: loading || !question.trim() ? "not-allowed" : "pointer",
                opacity: loading || !question.trim() ? 0.6 : 1,
                boxShadow: loading || !question.trim() ? "none" : "0 2px 8px rgba(0,123,255,0.18)",
                transition: "background 0.2s, opacity 0.2s",
              }}
              aria-label="Submit question"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
