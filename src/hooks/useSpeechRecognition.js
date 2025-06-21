// File: src/hooks/useSpeechRecognition.js
import { useRef, useState, useEffect } from 'react';

export const useSpeechRecognition = (onResult) => {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');
      onResult(transcript.trim());
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [onResult]);

  const startListening = () => {
    if (!recognitionRef.current || isListening) return;
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (!recognitionRef.current || !isListening) return;
    recognitionRef.current.stop();
  };

  return {
    startListening,
    stopListening,
    isListening
  };
};
