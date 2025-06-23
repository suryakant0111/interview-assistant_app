import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { Button } from '../Button';

export default function SpeechController({ onTextUpdate }) {
  const finalizedTranscriptsRef = useRef([]);
  const currentInterimRef = useRef('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState(null);

  const onResult = useCallback((transcript, isFinal) => {
    let sanitized = transcript.trim();
    if (!sanitized) return;

    if (isFinal) {
      finalizedTranscriptsRef.current.push(sanitized);
      currentInterimRef.current = '';
    } else {
      currentInterimRef.current = sanitized;
    }

    const full = [...finalizedTranscriptsRef.current, currentInterimRef.current].join(' ').trim();
    onTextUpdate(full);
  }, [onTextUpdate]);

  const onStart = useCallback(() => {
    finalizedTranscriptsRef.current = [];
    currentInterimRef.current = '';
    setIsListening(true);
  }, []);
  

  const onEnd = useCallback(() => {
    setIsListening(false);
    const finalText = [...finalizedTranscriptsRef.current].join(' ').trim();
    onTextUpdate(finalText);
  }, [onTextUpdate]);

  const onError = useCallback((err) => {
    setSpeechError(err);
    setIsListening(false);
    finalizedTranscriptsRef.current = [];
    currentInterimRef.current = '';
  }, []);

  const {
    startListening,
    stopListening,
    isSupported
  } = useSpeechRecognition({ onResult, onStart, onEnd, onError });

  const handleStart = () => {
    if (!isListening) startListening();
  };

  const handleStop = () => {
    if (isListening) stopListening();
  };

  return (
    <div className="flex items-center gap-3">
      <span
        className={`inline-block w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}
        title={isListening ? 'Listening' : 'Not listening'}
        aria-label={isListening ? 'Listening' : 'Not listening'}
      />
      <Button
        onClick={handleStart}
        disabled={isListening || !isSupported}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-white transition-transform hover:scale-105 ${isListening ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'}`}
      >
        🎙 Start
      </Button>
      {isListening && (
        <Button
          onClick={handleStop}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
        >
          ⛔ Stop
        </Button>
      )}
    </div>
  );
}
