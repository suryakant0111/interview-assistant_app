import { useEffect, useRef, useState } from "react";

export const useSpeechRecognition = ({
  onResult,
  autoRestart = false,
  onStart,
  onEnd,
  onError,
}) => {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const autoRestartRef = useRef(autoRestart);
  const restartTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);
  const isStartingRef = useRef(false);
  const lastTranscriptRef = useRef(''); // Track last sent transcript
  const debounceTimeoutRef = useRef(null); // Debounce onResult

  useEffect(() => {
    autoRestartRef.current = autoRestart;
  }, [autoRestart]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      isStartingRef.current = false;
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      console.warn("Window object not available.");
      onError?.("Window object not available");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported in this browser.");
      onError?.("SpeechRecognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      if (!isMountedRef.current) return;
      isStartingRef.current = false;
      setIsListening(true);
      console.log("🎙️ Speech recognition started at", new Date().toISOString());
      lastTranscriptRef.current = '';
      onStart?.();
    };

    recognition.onend = () => {
      if (!isMountedRef.current) return;
      setIsListening(false);
      console.log("🛑 Speech recognition stopped at", new Date().toISOString());
      onEnd?.();

      if (autoRestartRef.current && recognitionRef.current && !isListening && !isStartingRef.current) {
        console.log("Scheduling auto-restart...");
        restartTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current && recognitionRef.current && !isListening) {
            try {
              console.log("Attempting auto-restart...");
              isStartingRef.current = true;
              recognitionRef.current.start();
            } catch (err) {
              console.warn("Auto-restart failed:", err.message);
              isStartingRef.current = false;
              onError?.(err.message);
            }
          }
        }, 1000);
      }
    };

    recognition.onaudioend = () => {
      console.log("🔇 Audio input ended at", new Date().toISOString());
    };

    recognition.onaudiostart = () => {
      console.log("🔊 Audio input started at", new Date().toISOString());
    };

    recognition.onresult = (event) => {
      if (!isMountedRef.current) return;

      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript + " ";
        }
      }

      const combinedTranscript = (finalTranscript || interimTranscript).trim();
      if (combinedTranscript && combinedTranscript !== lastTranscriptRef.current) {
        // Debounce onResult to prevent rapid calls
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(() => {
          console.log("Sending transcript:", combinedTranscript, "IsFinal:", !!finalTranscript);
          onResult?.(combinedTranscript, !!finalTranscript);
          lastTranscriptRef.current = combinedTranscript;
        }, 200); // 200ms debounce
      } else {
        console.log("Skipped duplicate or empty transcript:", combinedTranscript);
      }
    };

    recognition.onerror = (event) => {
      if (!isMountedRef.current) return;
      console.error("❌ Speech recognition error:", event.error, "Details:", event);
      setIsListening(false);
      isStartingRef.current = false;
      onError?.(event.error);

      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop();
          console.log("Cleanup: stopped recognition");
        } catch (err) {
          console.warn("Cleanup stop failed:", err.message);
        }
      }
      recognitionRef.current = null;
      isStartingRef.current = false;
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
    };
  }, [onResult, onStart, onEnd, onError]);

  const startListening = () => {
    if (!recognitionRef.current || isListening || isStartingRef.current) {
      console.log("Cannot start: recognitionRef missing, already listening, or starting");
      return;
    }
    try {
      console.log("Starting speech recognition...");
      isStartingRef.current = true;
      recognitionRef.current.start();
    } catch (err) {
      console.error("Error starting recognition:", err.message);
      isStartingRef.current = false;
      onError?.(err.message);
      if (err.name === "NotAllowedError") {
        alert("Microphone access denied. Please enable microphone permissions in your browser settings.");
      }
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) {
      console.log("Cannot stop: recognitionRef missing");
      setIsListening(false);
      isStartingRef.current = false;
      onEnd?.();
      return;
    }
    try {
      console.log("Stopping speech recognition...");
      recognitionRef.current.stop();
      setIsListening(false);
      isStartingRef.current = false;
      onEnd?.();
    } catch (err) {
      console.error("Error stopping recognition:", err.message);
      setIsListening(false);
      isStartingRef.current = false;
      onError?.(err.message);
    }
  };

  return {
    startListening,
    stopListening,
    isListening,
    isSupported: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
  };
};