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
  const debounceTimeoutRef = useRef(null);
  const lastTranscriptRef = useRef('');
  const isMountedRef = useRef(true);
  const activeRef = useRef(false);

  useEffect(() => {
    autoRestartRef.current = autoRestart;
  }, [autoRestart]);

  const cleanup = () => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log("Cleanup: stopped recognition");
      } catch (err) {
        console.warn("Cleanup stop failed:", err.message);
      }
      recognitionRef.current = null;
    }
    activeRef.current = false;
    setIsListening(false);
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, []);

  const initializeRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported");
      onError?.("SpeechRecognition not supported");
      return false;
    }

    cleanup();

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      if (!isMountedRef.current) return;
      setIsListening(true);
      activeRef.current = true;
      lastTranscriptRef.current = '';
      console.log("🎙️ Recognition started");
      onStart?.();
    };

    recognition.onend = () => {
      if (!isMountedRef.current) return;
      setIsListening(false);
      activeRef.current = false;
      console.log("🛑 Recognition ended");
      onEnd?.();

      if (autoRestartRef.current && isMountedRef.current) {
        restartTimeoutRef.current = setTimeout(() => {
          if (!activeRef.current) {
            console.log("Restarting speech recognition...");
            startListening();
          }
        }, 400);
      }
    };

    recognition.onresult = (event) => {
      if (!isMountedRef.current) return;

      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) final += transcript + " ";
        else interim += transcript + " ";
      }

      const combined = (final || interim).trim();

      if (combined && combined !== lastTranscriptRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = setTimeout(() => {
          onResult?.(combined, !!final);
          lastTranscriptRef.current = combined;
        }, 400);
      }
    };

    recognition.onerror = (event) => {
      if (!isMountedRef.current) return;
      console.error("❌ Speech error:", event.error);
      cleanup();
      onError?.(event.error);
    };

    recognitionRef.current = recognition;
    return true;
  };

  const startListening = () => {
    if (activeRef.current || !initializeRecognition()) return;

    window.speechSynthesis.cancel();

    setTimeout(() => {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          try {
            recognitionRef.current?.start();
          } catch (err) {
            console.error("Start failed:", err.message);
            cleanup();
            onError?.(err.message);
          }
        })
        .catch((err) => {
          console.error("Mic error:", err.message);
          cleanup();
          onError?.(err.name === "NotAllowedError" ? "not-allowed" : err.message);
          if (err.name === "NotAllowedError") {
            alert("Microphone access denied. Enable mic in browser settings.");
          }
        });
    }, 200);
  };

  const stopListening = () => {
    cleanup();
  };

  return {
    startListening,
    stopListening,
    isListening,
    isSupported: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
  };
};
