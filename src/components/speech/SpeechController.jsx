import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { Button } from '../Button';
import { Mic, Square } from 'lucide-react';

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
  } = useSpeechRecognition({ onResult, onStart, onEnd, onError, autoRestart: false });
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
      {/* Modern mic button */}
      <Button
        onClick={handleStart}
        disabled={isListening || !isSupported}
        variant="primary"
        size="sm"
        className={`rounded-full w-10 h-10 p-0 flex items-center justify-center shadow-md ${isListening ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
        title="Start voice input"
        aria-label="Start voice input"
      >
        <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
      </Button>
      {/* Modern stop button */}
      {isListening && (
        <Button
          onClick={handleStop}
          variant="danger"
          size="sm"
          className="rounded-full w-10 h-10 p-0 flex items-center justify-center shadow-md bg-red-600 hover:bg-red-700 transition-colors"
          title="Stop voice input"
          aria-label="Stop voice input"
        >
          <Square className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}
