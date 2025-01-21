import { useState, useEffect, useRef } from 'react';

interface AudioAnalyzerProps {
  audioStream: MediaStream | null;
  onVolumeChange: (volume: number) => void;
}

const AudioAnalyzer: React.FC<AudioAnalyzerProps> = ({ audioStream, onVolumeChange }) => {
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!audioStream) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(audioStream);
    source.connect(analyser);
    analyser.fftSize = 256;
    analyzerRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const analyze = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
      const volume = average / 255; // Normalize to 0-1
      onVolumeChange(volume);
      animationRef.current = requestAnimationFrame(analyze);
    };

    analyze();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      source.disconnect();
      analyser.disconnect();
      audioContext.close();
    };
  }, [audioStream, onVolumeChange]);

  return null; // This component doesn't render anything
};

export default AudioAnalyzer;

