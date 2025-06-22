import { useEffect, useRef, useState } from 'react';

export function useSpeechRecognition(onResult) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('SpeechRecognition API not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    recognition.continuous = !isMobile;
    recognition.interimResults = !isMobile;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      const current = (finalTranscriptRef.current + interim).trim();
      if (current !== '') {
        onResult(current);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [onResult]);

  const startListening = () => {
    if (!recognitionRef.current || isListening) return;

    finalTranscriptRef.current = ''; // Reset before starting

    try {
      if (!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.speechSynthesis?.cancel?.();
      }
    } catch (_) {}

    recognitionRef.current.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      finalTranscriptRef.current = ''; // ✅ Clear after stopping to prevent reuse
    }
  };

  return {
    startListening,
    stopListening,
    isListening,
  };
}
