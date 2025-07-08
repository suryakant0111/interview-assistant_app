import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { User, Bot, Mic, X, Send, Plus, Settings, Search, MessageSquare, Trash2, Menu, ChevronLeft, Edit3 } from "lucide-react";
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
  const [currentChatId, setCurrentChatId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const inputRef = useRef(null);
  const chatEndRef = useRef(null);
  
  // Initialize recent chats from localStorage
  const [recentChats, setRecentChats] = useState(() => {
    try {
      const saved = localStorage.getItem('recentChats');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Speech controller ref
  const speechControllerRef = useRef();

  // Create new chat session
  const createNewChat = () => {
    setChatHistory([]);
    setPosition("");
    setResume("");
    setJobDesc("");
    setCurrentChatId(null);
    setQuestion("");
    setShowMobileMenu(false);
  };

  // Load existing chat session
  const loadChat = (chat) => {
    setChatHistory(chat.history || []);
    setPosition(chat.position || "");
    setResume(chat.resume || "");
    setJobDesc(chat.jobDesc || "");
    setCurrentChatId(chat.id);
    setQuestion("");
    setShowMobileMenu(false);
  };

  // Delete chat session
  const deleteChat = (chatId, e) => {
    e.stopPropagation();
    const updatedChats = recentChats.filter(chat => chat.id !== chatId);
    setRecentChats(updatedChats);
    localStorage.setItem('recentChats', JSON.stringify(updatedChats));
    
    if (currentChatId === chatId) {
      createNewChat();
    }
    
    toast.success('Chat deleted');
  };

  // Save or update chat session
  const saveOrUpdateChat = (newHistory) => {
    if (newHistory.length === 0) return;

    const chatData = {
      id: currentChatId || Date.now(),
      title: newHistory[0]?.question?.slice(0, 50) || 'New Chat',
      history: newHistory,
      position: position,
      resume: resume,
      jobDesc: jobDesc,
      updatedAt: new Date().toISOString()
    };

    let updatedChats;
    if (currentChatId) {
      updatedChats = recentChats.map(chat => 
        chat.id === currentChatId ? chatData : chat
      );
    } else {
      updatedChats = [chatData, ...recentChats];
      setCurrentChatId(chatData.id);
    }

    updatedChats = updatedChats.slice(0, 50);
    setRecentChats(updatedChats);
    localStorage.setItem('recentChats', JSON.stringify(updatedChats));
  };

  const handleSubmit = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    
    const devQuestions = [
      /who (created|developed|made|built) (you|u|this|the bot|the app)/i,
      /your (developer|creator|maker|author)/i,
      /who is behind (you|this|the bot|the app)/i
    ];
    
    if (devQuestions.some((re) => re.test(question))) {
      const newHistory = [...chatHistory, { question, answer: 'Suryakant Khevji' }];
      setChatHistory(newHistory);
      saveOrUpdateChat(newHistory);
      setQuestion("");
      setLoading(false);
      inputRef.current?.focus();
      return;
    }

    const previousContext = chatHistory
      .map((entry, idx) => `Q${idx + 1}: ${entry.question}\nA${idx + 1}: ${entry.answer}`)
      .join("\n\n");

    const fullPrompt = `You are acting as a highly prepared job candidate in a final round interview for the role of ${position || '[POSITION]'}.\n\n${question}\n\nResume:\n${resume}\n\nJob Description:\n${jobDesc}\n\nConversation History:\n${previousContext}`;

    try {
      const response = await fetchGeminiAnswer(fullPrompt);
      const newHistory = [...chatHistory, { question, answer: response }];
      setChatHistory(newHistory);
      saveOrUpdateChat(newHistory);
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

  // Filter chats based on search term
  const filteredChats = recentChats.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sidebarWidth = sidebarCollapsed ? 60 : 280;

  return (
    <div className="flex h-screen bg-[#0F0F0F] text-white overflow-hidden">
      {/* Mobile menu overlay */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed md:static top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out
          bg-[#171717] border-r border-[#2A2A2A] flex flex-col
          ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
        style={{ width: sidebarWidth }}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#2A2A2A]">
          <div className="flex items-center justify-between mb-4">
            {!sidebarCollapsed && (
              <h2 className="text-lg font-semibold text-white">Interview AI</h2>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex p-2 rounded-lg hover:bg-[#2A2A2A] transition-colors"
            >
              {sidebarCollapsed ? <ChevronLeft className="w-4 h-4 rotate-180" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {!sidebarCollapsed && (
            <>
              <button
                onClick={createNewChat}
                className="w-full flex items-center justify-center gap-2 bg-transparent border border-[#3A3A3A] hover:bg-[#2A2A2A] text-white rounded-lg py-2.5 px-4 transition-colors duration-200 mb-3"
              >
                <Plus className="w-4 h-4" />
                New chat
              </button>
              
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#888]" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder-[#888] focus:outline-none focus:border-[#4A4A4A] transition-colors"
                />
              </div>
            </>
          )}
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto">
          {sidebarCollapsed ? (
            <div className="p-2 space-y-2">
              <button
                onClick={createNewChat}
                className="w-full p-3 rounded-lg hover:bg-[#2A2A2A] transition-colors"
                title="New chat"
              >
                <Plus className="w-5 h-5 mx-auto" />
              </button>
            </div>
          ) : (
            <div className="p-2">
              {filteredChats.length === 0 ? (
                <div className="text-center text-[#888] py-8 px-4 text-sm">
                  {searchTerm ? 'No matching conversations' : 'No conversations yet'}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredChats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`
                        group relative rounded-lg cursor-pointer transition-all duration-200
                        ${currentChatId === chat.id 
                          ? 'bg-[#2A2A2A] border-l-2 border-[#10A37F]' 
                          : 'hover:bg-[#2A2A2A]'
                        }
                      `}
                      onClick={() => loadChat(chat)}
                    >
                      <div className="flex items-center gap-3 p-3 pr-8">
                        <MessageSquare className="w-4 h-4 text-[#888] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">
                            {chat.title}
                          </div>
                          {chat.position && (
                            <div className="text-xs text-[#888] mt-1 truncate">
                              {chat.position}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => deleteChat(chat.id, e)}
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-[#3A3A3A] transition-all duration-200"
                        title="Delete chat"
                      >
                        <Trash2 className="w-3 h-3 text-[#888]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-[#2A2A2A]">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#2A2A2A] cursor-pointer transition-colors">
              <div className="w-8 h-8 rounded-full bg-[#10A37F] flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">Interview Assistant</div>
                <div className="text-xs text-[#888]">Ready to practice</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-[#2A2A2A] bg-[#171717]">
          <button
            onClick={() => setShowMobileMenu(true)}
            className="p-2 rounded-lg hover:bg-[#2A2A2A] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Interview AI</h1>
          <div className="w-9" /> {/* Spacer */}
        </div>

        {/* Main chat area: scrollable, includes fields and messages */}
        <div className="flex-1 flex flex-col overflow-y-auto" style={{ minHeight: 0 }}>
          {/* Responsive fields: row on desktop, column on mobile */}
          <div className="w-full max-w-4xl mx-auto px-2 pt-4 pb-2">
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={position}
                onChange={e => setPosition(e.target.value)}
                placeholder="Enter position/role (e.g., Software Engineer)"
                className="flex-1 rounded-lg border border-[#222c37] bg-[#181a1b] text-white px-4 py-2 text-base mb-1 md:mb-0"
                aria-label="Position or role"
              />
              <textarea
                value={resume}
                onChange={e => setResume(e.target.value)}
                placeholder="Paste your resume here... (optional)"
                className="flex-1 min-h-[60px] rounded-lg border border-[#222c37] bg-[#181a1b] text-white px-4 py-2 text-base mb-1 md:mb-0 resize-vertical"
              />
              <textarea
                value={jobDesc}
                onChange={e => setJobDesc(e.target.value)}
                placeholder="Paste the job description here... (optional)"
                className="flex-1 min-h-[60px] rounded-lg border border-[#222c37] bg-[#181a1b] text-white px-4 py-2 text-base resize-vertical"
              />
            </div>
          </div>
          {/* Chat messages */}
          <div className="flex flex-col flex-1 w-full max-w-2xl mx-auto px-2 pb-4 gap-3">
            {chatHistory.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#10A37F] rounded-full flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Ready for your interview?
                </h3>
                <p className="text-[#888] max-w-md mx-auto">
                  Ask any interview question and I'll help you prepare the perfect response based on your background and the job requirements.
                </p>
              </div>
            ) : (
              chatHistory.map((entry, idx) => (
                <div key={idx} className="space-y-4">
                  {/* User Message */}
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-[#171717] rounded-lg p-4 text-white">
                        <div className="whitespace-pre-wrap break-words">{entry.question}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bot Response */}
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#10A37F] flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-[#171717] rounded-lg p-4 text-white">
                        {entry.answer ? (
                          <AnswerRenderer content={entry.answer} />
                        ) : (
                          <span className="text-[#888] italic">No response generated</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#10A37F] flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="bg-[#171717] rounded-lg p-4">
                    <div className="flex items-center gap-3 text-[#888]">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#10A37F] border-t-transparent"></div>
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-[#2A2A2A] bg-[#0F0F0F]">
          <div className="max-w-4xl mx-auto p-6">
            <div className="relative">
              <div className="flex items-end gap-3 bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
                <div className="flex-shrink-0">
                  <SpeechController 
                    ref={speechControllerRef}
                    onTextUpdate={handleTextUpdate} 
                  />
                </div>
                
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    value={question}
                    onChange={(e) => handleTextUpdate(e.target.value)}
                    placeholder="Ask an interview question..."
                    rows={1}
                    className="w-full resize-none border-none outline-none bg-transparent text-white placeholder-[#888] text-base leading-6 max-h-40 overflow-y-auto"
                    style={{ minHeight: '24px' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (!loading && question.trim()) {
                          handleSubmit();
                        }
                      }
                    }}
                    disabled={loading}
                  />
                </div>

                <div className="flex items-center gap-2">
                  {question && (
                    <button
                      onClick={clearQuestion}
                      className="p-2 text-[#888] hover:text-white transition-colors rounded-lg hover:bg-[#2A2A2A]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={loading || !question.trim()}
                    className={`
                      p-2 rounded-lg transition-all duration-200
                      ${loading || !question.trim()
                        ? 'text-[#666] cursor-not-allowed'
                        : 'text-white hover:bg-[#2A2A2A] active:bg-[#3A3A3A]'
                      }
                    `}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}