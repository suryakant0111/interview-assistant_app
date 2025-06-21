// src/hooks/useSpeechRecognition.js
import { useRef, useState, useEffect } from 'react';

export const useSpeechRecognition = (onResult) => {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [audioStream, setAudioStream] = useState(null);

  const constraints = {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  };

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
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onResult]);

  const startListening = async () => {
    if (!recognitionRef.current || isListening) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setAudioStream(stream);
      recognitionRef.current.start();
    } catch (err) {
      console.error('Mic permission or device error:', err);
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current || !isListening) return;
    recognitionRef.current.stop();
    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
    }
    setAudioStream(null);
  };

  return {
    startListening,
    stopListening,
    isListening,
  };
};
