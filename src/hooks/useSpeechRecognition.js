// File: src/hooks/useSpeechRecognition.js
import { useRef, useState, useEffect } from 'react';

export const useSpeechRecognition = (onResult) => {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Web Speech API not supported.');
      return;
    }

    const recognition = new SpeechRecognition();

    // ✅ Mobile-safe defaults
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join('');
      onResult(transcript.trim());
    };

    recognition.onerror = (event) => {
      console.error('Recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [onResult]);

  const startListening = () => {
    try {
      if (isListening || !recognitionRef.current) return;
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.error('Start error:', e);
    }
  };

  const stopListening = () => {
    try {
      if (!isListening || !recognitionRef.current) return;
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (e) {
      console.error('Stop error:', e);
    }
  };

  return { startListening, stopListening, isListening };
};
