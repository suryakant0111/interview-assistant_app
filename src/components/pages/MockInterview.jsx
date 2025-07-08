import React, { useState, useRef, useEffect } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { fetchGeminiQuestions, fetchGeminiAnswer, analyzeResume } from '../../lib/geminiApi';

export default function MockInterview() {
  // Stepper state
  const [step, setStep] = useState(1);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [interviewType, setInterviewType] = useState('technical');
  const [difficulty, setDifficulty] = useState('medium');

  // Interview state
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [chat, setChat] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [mediaError, setMediaError] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [sessionFeedback, setSessionFeedback] = useState('');
  const [fillerWords, setFillerWords] = useState(0);
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const chatEndRef = useRef(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [interviewActive, setInterviewActive] = useState(false);
  const [resumeProcessing, setResumeProcessing] = useState(false);
  const [userAskingQuestion, setUserAskingQuestion] = useState(false);

  // Step 1: Setup
  const handleStart = async () => {
    setLoadingQuestions(true);
    setStep(2);
    setQuestions([]);
    setChat([]);
    setConversationHistory([]);
    setSessionFeedback('');
    
    try {
      let resumeAnalysis = '';
      
      // Process resume if uploaded
      if (resumeFile) {
        setResumeProcessing(true);
        const formData = new FormData();
        formData.append('resume', resumeFile);
        resumeAnalysis = await analyzeResume(formData);
        setResumeText(resumeAnalysis);
        setResumeProcessing(false);
      }
      
      // Generate initial questions using job details and resume
      const prompt = `Generate ${difficulty} level ${interviewType} interview questions for a ${jobTitle} position. 
      Job description: ${jobDescription}
      ${resumeAnalysis ? `Candidate resume summary: ${resumeAnalysis}` : ''}
      Generate 5-7 questions. Format as a JSON array: ["question1", "question2", ...]`;
      
      const result = await fetchGeminiQuestions(prompt);
      setQuestions(result);
    } catch (error) {
      console.error('Error generating questions:', error);
      // Fallback questions
      setQuestions([
        'What is your greatest strength?',
        'Tell me about a challenge you faced at work and how you handled it.',
        'Why do you want to work at our company?',
        'Describe a time you showed leadership.',
        'Where do you see yourself in five years?'
      ]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Video/mic setup
  useEffect(() => {
    if (step !== 2) return;
    
    const setupMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720 }, 
          audio: true 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setMediaError('Could not access webcam or microphone. Please check permissions.');
        console.error('Media error:', err);
      }
    };
    
    setupMedia();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [step]);

  // Start interview when questions are ready
  useEffect(() => {
    if (step === 2 && questions.length > 0 && !interviewActive) {
      startInterview();
    }
  }, [questions, step, interviewActive]);

  // Start the interview
  const startInterview = () => {
    setInterviewActive(true);
    askAIQuestion(0);
  };

  // Scroll chat to bottom on new message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat]);

  // TTS: AI asks question
  const askAIQuestion = (idx) => {
    if (!questions[idx]) return;
    
    const question = questions[idx];
    setCurrentQuestion(question);
    
    // Add to conversation history
    setConversationHistory(prev => [
      ...prev, 
      { role: 'assistant', content: question }
    ]);
    
    // Add to chat UI
    setChat(prev => [...prev, { sender: 'ai', text: question }]);
    setAiSpeaking(true);
    setTranscript('');
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(question);
      utterance.lang = 'en-US';
      utterance.rate = 1;
      utterance.pitch = 1;
      
      utterance.onend = () => {
        setAiSpeaking(false);
        setTimeout(() => startListening(), 400);
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      setAiSpeaking(false);
      startListening();
    }
  };

  // Speech recognition hook
  const {
    startListening,
    stopListening,
    isListening,
    isSupported
  } = useSpeechRecognition({
    onResult: (text, isFinal) => {
      setTranscript(text);
      
      // Analyze filler words in real-time
      const fillerWords = ['um', 'uh', 'like', 'you know', 'so', 'well', 'actually', 'basically'];
      const words = text.split(' ');
      const fillerCount = words.filter(word => fillerWords.includes(word.toLowerCase())).length;
      setFillerWords(fillerCount);
      
      if (isFinal && !aiSpeaking) {
        handleUserResponse(text);
      }
    },
    onStart: () => setListening(true),
    onEnd: () => setListening(false),
    onError: () => setListening(false),
    autoRestart: false
  });

  // Handle user response
  const handleUserResponse = async (text) => {
    const userResponse = text || transcript;
    
    // Add to conversation history
    setConversationHistory(prev => [
      ...prev, 
      { role: 'user', content: userResponse }
    ]);
    
    // Add to chat UI
    setChat(prev => [...prev, { sender: 'user', text: userResponse }]);
    setTranscript('');
    stopListening();
    
    // Check if user is asking a question
    const isQuestion = userResponse.toLowerCase().includes('?') || 
      userResponse.toLowerCase().includes('what do you mean') ||
      userResponse.toLowerCase().includes('can you explain') ||
      userResponse.toLowerCase().includes('clarify');
    
    if (isQuestion) {
      setUserAskingQuestion(true);
      setTimeout(() => answerUserQuestion(userResponse), 500);
    } else {
      setUserAskingQuestion(false);
      setTimeout(() => generateFollowUp(userResponse), 500);
    }
  };

  // Answer user's question
  const answerUserQuestion = async (userQuestion) => {
    setFeedbackLoading(true);
    
    try {
      const context = `You are an expert interviewer conducting a mock interview for a ${jobTitle} position. 
      The candidate just asked you a question: "${userQuestion}"
      
      Previous conversation:
      ${conversationHistory.slice(-4).map(msg => `${msg.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${msg.content}`).join('\n')}`;
      
      const prompt = `${context}
      
      Provide a helpful, professional response to the candidate's question.`;
      
      const aiResponse = await fetchGeminiAnswer(prompt);
      
      // Add to conversation history
      setConversationHistory(prev => [
        ...prev, 
        { role: 'assistant', content: aiResponse }
      ]);
      
      // Add to chat UI
      setChat(prev => [...prev, { sender: 'ai', text: aiResponse }]);
      setAiSpeaking(true);
      
      // Speak the response
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(aiResponse);
        utterance.lang = 'en-US';
        utterance.rate = 1;
        utterance.pitch = 1;
        
        utterance.onend = () => {
          setAiSpeaking(false);
          // After answering, return to the current question
          setTimeout(() => {
            setChat(prev => [...prev, { 
              sender: 'ai', 
              text: `Now back to our interview: ${currentQuestion}` 
            }]);
            
            // Speak the return to interview
            const returnUtterance = new SpeechSynthesisUtterance(`Now back to our interview: ${currentQuestion}`);
            returnUtterance.lang = 'en-US';
            returnUtterance.rate = 1;
            returnUtterance.pitch = 1;
            
            returnUtterance.onend = () => {
              setAiSpeaking(false);
              setTimeout(() => startListening(), 400);
            };
            
            window.speechSynthesis.speak(returnUtterance);
          }, 500);
        };
        
        window.speechSynthesis.speak(utterance);
      } else {
        setAiSpeaking(false);
        setTimeout(() => startListening(), 400);
      }
    } catch (error) {
      console.error('Error answering user question:', error);
      // Default response
      setChat(prev => [...prev, { 
        sender: 'ai', 
        text: "I'm sorry, I didn't understand your question. Let's continue with the interview." 
      }]);
      setTimeout(() => startListening(), 1000);
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Generate AI follow-up question or feedback
  const generateFollowUp = async (userResponse) => {
    setFeedbackLoading(true);
    
    try {
      // Prepare context for the AI
      const context = `You are an expert interviewer conducting a mock interview for a ${jobTitle} position. 
      Job description: ${jobDescription}
      ${resumeText ? `Candidate resume summary: ${resumeText}` : ''}
      
      Previous conversation:
      ${conversationHistory.slice(-6).map(msg => `${msg.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${msg.content}`).join('\n')}
      
      Candidate just said: "${userResponse}"`;
      
      // Determine next action
      const prompt = `${context}
      
      Decide your next action:
      1. Ask a follow-up question to dive deeper into the current topic
      2. Provide brief feedback on the candidate's response
      3. Move to the next prepared question
      4. Ask a new question from your prepared list
      
      Format your response as JSON:
      {
        "action": "follow-up" | "feedback" | "next-question" | "new-question",
        "content": "Your content here"
      }`;
      
      const aiDecision = await fetchGeminiAnswer(prompt);
      let responseData;
      
      try {
        responseData = JSON.parse(aiDecision);
      } catch {
        responseData = { action: 'next-question', content: '' };
      }
      
      // Handle different response types
      if (responseData.action === 'follow-up') {
        // Add new follow-up question
        setQuestions(prev => [...prev, responseData.content]);
        askAIQuestion(questions.length);
      } 
      else if (responseData.action === 'feedback') {
        // Show feedback in chat
        setChat(prev => [...prev, { sender: 'feedback', text: responseData.content }]);
        
        // Wait a moment then ask next question
        setTimeout(() => {
          if (questions.length > chat.filter(m => m.sender === 'ai').length) {
            askAIQuestion(chat.filter(m => m.sender === 'ai').length);
          } else {
            endInterview();
          }
        }, 3000);
      } 
      else if (responseData.action === 'next-question') {
        // Move to next prepared question
        if (questions.length > chat.filter(m => m.sender === 'ai').length) {
          askAIQuestion(chat.filter(m => m.sender === 'ai').length);
        } else {
          endInterview();
        }
      }
      else if (responseData.action === 'new-question') {
        // Add completely new question
        setQuestions(prev => [...prev, responseData.content]);
        askAIQuestion(questions.length);
      }
    } catch (error) {
      console.error('Error generating follow-up:', error);
      // Default to next question
      if (questions.length > chat.filter(m => m.sender === 'ai').length) {
        askAIQuestion(chat.filter(m => m.sender === 'ai').length);
      } else {
        endInterview();
      }
    } finally {
      setFeedbackLoading(false);
    }
  };

  // End the interview
  const endInterview = () => {
    setInterviewActive(false);
    generateSessionFeedback();
    setStep(3);
  };

  // Generate session feedback
  const generateSessionFeedback = async () => {
    setFeedbackLoading(true);
    try {
      const prompt = `Provide comprehensive feedback on this mock interview for a ${jobTitle} position:
        Conversation history:
        ${conversationHistory.map(msg => `${msg.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${msg.content}`).join('\n')}
        
        Format feedback as:
        <h3>Overall Performance</h3>
        [summary]
        
        <h3>Strengths</h3>
        - [point 1]
        - [point 2]
        
        <h3>Areas for Improvement</h3>
        - [point 1]
        - [point 2]
        
        <h3>Recommendations</h3>
        - [recommendation 1]
        - [recommendation 2]`;
      
      const feedback = await fetchGeminiAnswer(prompt);
      setSessionFeedback(feedback);
    } catch {
      setSessionFeedback('AI feedback could not be generated.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Stepper UI
  const steps = [
    { label: 'Setup' },
    { label: 'Interview' },
    { label: 'Feedback' }
  ];
  
  const progressPercent = questions.length 
    ? Math.round((chat.filter(m => m.sender === 'ai').length / questions.length) * 100)
    : 0;

  // Restart interview
  const handleRestart = () => {
    setStep(1);
    setJobTitle('');
    setJobDescription('');
    setResumeText('');
    setResumeFile(null);
    setQuestions([]);
    setChat([]);
    setConversationHistory([]);
    setTranscript('');
    setAiSpeaking(false);
    setListening(false);
    setMediaError('');
    setLoadingQuestions(false);
    setSessionFeedback('');
    setFillerWords(0);
    setInterviewActive(false);
    setResumeProcessing(false);
    setUserAskingQuestion(false);
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Handle resume upload
  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Limit to 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert('Please upload a file smaller than 5MB');
        return;
      }
      
      setResumeFile(file);
      
      // Read text content for display
      const reader = new FileReader();
      reader.onload = (event) => {
        setResumeText(event.target.result.slice(0, 1000) + (event.target.result.length > 1000 ? '...' : ''));
      };
      reader.readAsText(file);
    }
  };

  // Speak text using TTS
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1;
      utterance.pitch = 1;
      
      utterance.onend = () => {
        setAiSpeaking(false);
        if (!userAskingQuestion) {
          setTimeout(() => startListening(), 400);
        }
      };
      
      setAiSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black/90 py-8 px-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white drop-shadow bg-clip-text">
            Interactive <span className="text-pink-400">AI Interview</span>
          </h1>
          <p className="text-white/70 mt-2">
            Practice with a human-like interviewer that responds to your questions
          </p>
        </div>
        {/* Stepper/Progress Bar */}
        <div className="mb-8 bg-white/5 border border-white/10 rounded-xl shadow-xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-center mb-2">
            {steps.map((s, idx) => (
              <div key={s.label} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step === idx + 1 
                    ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg' 
                    : 'bg-white/10 text-white/60'
                }`}>
                  {idx + 1}
                </div>
                <span className={`ml-2 mr-4 font-medium ${
                  step === idx + 1 ? 'text-pink-400 font-semibold' : 'text-white/50'
                }`}>
                  {s.label}
                </span>
                {idx < steps.length - 1 && <div className="w-8 h-1 bg-white/20 rounded" />}
              </div>
            ))}
          </div>
          {step === 2 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-white/60 mb-1">
                <span>Progress</span>
                <span>{chat.filter(m => m.sender === 'ai').length}/{questions.length} questions</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
        {/* Step 1: Setup */}
        {step === 1 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl shadow-xl p-8 w-full max-w-2xl mx-auto backdrop-blur-md">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Interview Setup</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Job Title *
                </label>
                <input
                  className="w-full border border-white/10 rounded-lg px-4 py-3 bg-black/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
                  placeholder="e.g. Software Engineer"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Interview Type *
                </label>
                <select
                  className="w-full border border-white/10 rounded-lg px-4 py-3 bg-black/60 text-white focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
                  value={interviewType}
                  onChange={e => setInterviewType(e.target.value)}
                >
                  <option value="technical">Technical</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="leadership">Leadership</option>
                  <option value="case">Case Study</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Difficulty Level *
                </label>
                <select
                  className="w-full border border-white/10 rounded-lg px-4 py-3 bg-black/60 text-white focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                >
                  <option value="easy">Beginner</option>
                  <option value="medium">Intermediate</option>
                  <option value="hard">Advanced</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Job Description *
                </label>
                <textarea
                  className="w-full min-h-[120px] border border-white/10 rounded-lg px-4 py-3 bg-black/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
                  placeholder="Paste job description or key requirements..."
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Upload Resume (Optional - for personalized questions)
                </label>
                <input
                  type="file"
                  accept=".pdf,.txt,.docx"
                  onChange={handleResumeUpload}
                  className="w-full border border-white/10 rounded-lg px-4 py-3 bg-black/60 text-white focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
                />
                {resumeText && (
                  <div className="mt-3 bg-black/60 p-3 rounded-lg border border-white/10">
                    <h4 className="font-medium text-white/80 mb-1">Resume Content:</h4>
                    <p className="text-white/60 text-sm whitespace-pre-wrap">{resumeText}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <button
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-pink-500 hover:to-indigo-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-0 outline-none focus:ring-4 focus:ring-pink-400/40"
                disabled={!jobTitle.trim() || !jobDescription.trim() || resumeProcessing}
                onClick={handleStart}
              >
                {resumeProcessing ? (
                  <span className="flex items-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Analyzing Resume...
                  </span>
                ) : (
                  'Start Interview'
                )}
              </button>
            </div>
          </div>
        )}
        {/* Step 2: Interview Room */}
        {step === 2 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
            <div className="flex flex-col md:flex-row">
              {/* Video Panel */}
              <div className="w-full md:w-2/5 bg-black/80 p-4 relative">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-green-500 animate-pulse`}></div>
                    <span className="text-white text-sm">
                      Live
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${listening ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-white">
                      {listening ? 'Mic Active' : 'Mic Off'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-pink-500/20 px-3 py-1 rounded-full text-pink-200 text-sm">
                      Filler Words: {fillerWords}
                    </div>
                  </div>
                </div>
                {mediaError && (
                  <div className="mt-4 p-3 bg-red-500/20 text-red-200 rounded-lg">
                    {mediaError}
                  </div>
                )}
                <div className="mt-4 bg-black/60 p-3 rounded-lg">
                  <h4 className="text-white text-sm font-medium mb-2">Interview Tips:</h4>
                  <ul className="text-white/60 text-xs space-y-1">
                    <li>• Ask for clarification if a question is unclear</li>
                    <li>• Answer questions with specific examples</li>
                    <li>• Speak clearly and at a moderate pace</li>
                    <li>• Feel free to ask questions to the interviewer</li>
                  </ul>
                </div>
              </div>
              {/* Chat Panel */}
              <div className="w-full md:w-3/5 flex flex-col">
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-white">🤖</span>
                    </div>
                    AI Interviewer
                  </h3>
                </div>
                <div className="flex-1 bg-black/70 p-4 overflow-y-auto max-h-[500px]" style={{ minHeight: '500px' }}>
                  {loadingQuestions ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-pink-400 font-semibold">Preparing interview questions...</p>
                    </div>
                  ) : (
                    <>
                      {chat.map((msg, idx) => (
                        <div key={idx} className={`mb-6 ${msg.sender === 'ai' ? 'text-left' : msg.sender === 'feedback' ? 'text-center' : 'text-right'}`}>
                          {msg.sender === 'ai' ? (
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white">AI</span>
                              </div>
                              <div className="bg-black/80 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 shadow-md text-white">
                                <div className="font-medium text-pink-400 mb-1">Interviewer</div>
                                <div>{msg.text}</div>
                              </div>
                            </div>
                          ) : msg.sender === 'feedback' ? (
                            <div className="my-4">
                              <div className="inline-block bg-black/60 border border-pink-400/20 rounded-2xl px-4 py-3 shadow-sm">
                                <div className="flex items-center gap-2 text-pink-400 mb-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                  </svg>
                                  <div className="font-semibold">Feedback</div>
                                </div>
                                <div className="text-pink-200">{msg.text}</div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-3 justify-end">
                              <div className="bg-gradient-to-br from-indigo-500 to-pink-500 text-white rounded-2xl rounded-br-none px-4 py-3 shadow-md max-w-[80%]">
                                <div className="font-medium text-pink-100 mb-1">You</div>
                                <div>{msg.text}</div>
                              </div>
                              <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow">
                                <video
                                  ref={videoRef}
                                  autoPlay
                                  playsInline
                                  muted
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {/* Live transcript bubble */}
                      {isListening && (
                        <div className="flex justify-end mb-6">
                          <div className="flex items-start gap-3 justify-end">
                            <div className="bg-pink-200 text-pink-900 rounded-2xl rounded-br-none px-4 py-3 shadow-md max-w-[80%] animate-pulse">
                              <div className="font-medium text-pink-700 mb-1">Your Response</div>
                              <div>{transcript || <span className="text-pink-700 italic">Listening...</span>}</div>
                            </div>
                            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow">
                              <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </>
                  )}
                </div>
                <div className="border-t border-white/10 p-4 bg-black/80">
                  <div className="text-center text-sm text-white/60 min-h-[24px]">
                    {aiSpeaking ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        <span>AI is speaking...</span>
                      </div>
                    ) : isListening ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>Listening for your answer...</span>
                      </div>
                    ) : feedbackLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        <span>Thinking about your response...</span>
                      </div>
                    ) : (
                      'Ready for your response'
                    )}
                  </div>
                  {!isListening && !aiSpeaking && !feedbackLoading && (
                    <div className="mt-3 flex justify-center">
                      <button
                        onClick={() => startListening()}
                        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-pink-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl flex items-center font-bold shadow-lg border-0 outline-none focus:ring-4 focus:ring-pink-400/40"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                        </svg>
                        Start Speaking
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Step 3: Feedback/Report */}
        {step === 3 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white">
              <h2 className="text-2xl font-bold">Interview Report</h2>
              <p className="opacity-80">Review your performance and feedback</p>
            </div>
            <div className="p-6">
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">AI Feedback</h3>
                <div className="bg-black/60 rounded-xl p-6 border border-white/10 text-white/80">
                  {sessionFeedback}
                </div>
              </div>
              <button
                onClick={handleRestart}
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-pink-500 hover:to-indigo-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition transform hover:scale-105 border-0 outline-none focus:ring-4 focus:ring-pink-400/40"
              >
                Restart Interview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}