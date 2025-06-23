import { useEffect, useRef, useState } from "react";

export const useSpeechRecognition = ({
  onResult,
  autoRestart = true,
  onStart,
  onEnd,
  onError,
}) => {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const lastTranscriptRef = useRef('');
  const debounceRef = useRef(null);
  const isMountedRef = useRef(true);
  const autoRestartRef = useRef(autoRestart);

  useEffect(() => {
    autoRestartRef.current = autoRestart;
  }, [autoRestart]);

  useEffect(() => {
    isMountedRef.current = true;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onError?.("SpeechRecognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      lastTranscriptRef.current = '';
      onStart?.();
    };

    recognition.onend = () => {
      setIsListening(false);
      onEnd?.();
      if (autoRestartRef.current && isMountedRef.current) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            onError?.(e.message);
          }
        }, 400); // short pause buffer
      }
    };

    recognition.onerror = (event) => {
      onError?.(event.error);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += transcript + " ";
        else interim += transcript + " ";
      }

      const output = (final || interim).trim();
      if (!output || output === lastTranscriptRef.current) return;

      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        lastTranscriptRef.current = output;
        onResult?.(output, !!final);
      }, 250); // smart debounce
    };

    recognitionRef.current = recognition;

    return () => {
      isMountedRef.current = false;
      if (recognition) recognition.stop();
      clearTimeout(debounceRef.current);
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          try {
            recognitionRef.current.start();
          } catch (e) {
            onError?.(e.message);
          }
        })
        .catch((err) => {
          if (err.name === "NotAllowedError") {
            alert("Please allow microphone access.");
          }
          onError?.(err.message);
        });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  return {
    startListening,
    stopListening,
    isListening,
    isSupported: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
  };
};
