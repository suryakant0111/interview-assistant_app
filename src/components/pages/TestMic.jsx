import React, { useState } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';    

export default function TestMic() {
  const [result, setResult] = useState('');
  const { startListening, stopListening, isListening } = useSpeechRecognition(setResult);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">🎤 Test Mic</h2>
      <button
        onClick={startListening}
        disabled={isListening}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Start
      </button>
      <button
        onClick={stopListening}
        disabled={!isListening}
        className="px-4 py-2 bg-red-600 text-white rounded ml-2"
      >
        Stop
      </button>
      <p className="mt-4"><strong>Transcript:</strong> {result}</p>
    </div>
  );
}
