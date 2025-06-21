import React, { useEffect, useRef, useState } from 'react';

export function MicWaveform({ isListening }) {
  const [volume, setVolume] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!isListening) {
      cleanup();
      setVolume(0);
      return;
    }

    const initMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        source.connect(analyser);

        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;
        sourceRef.current = source;

        const updateVolume = () => {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setVolume(average);
          animationIdRef.current = requestAnimationFrame(updateVolume);
        };

        updateVolume();
      } catch (error) {
        console.error('MicWaveform: microphone access error', error);
      }
    };

    initMic();

    return () => {
      cleanup();
    };
  }, [isListening]);

  const cleanup = () => {
    if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
  };

  const barCount = 12;
  const bars = Array.from({ length: barCount }).map((_, i) => {
    const height = Math.max(4, (volume / 2) * (1 + Math.sin(i))) + 4;
    return (
      <div
        key={i}
        style={{
          height: `${height}px`,
          width: '4px',
          backgroundColor: 'rgb(99 102 241)', // Tailwind indigo-500
          borderRadius: '2px',
          margin: '0 2px',
          transition: 'height 0.1s ease-in-out',
        }}
      />
    );
  });

  return (
    <div
      className="flex items-end h-8"
      style={{
        display: isListening ? 'flex' : 'none',
        marginRight: '0.5rem',
        padding: '0 4px',
        background: '#fff',
        borderRadius: '8px',
      }}
    >
      {bars}
    </div>
  );
}
