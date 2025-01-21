"use client"

import { useEffect, useRef } from "react"

interface AudioAnalyzerProps {
  audioStream: MediaStream | null
  onVolumeChange: (volume: number) => void
  isActive: boolean
}

const AudioAnalyzer: React.FC<AudioAnalyzerProps> = ({ audioStream, onVolumeChange, isActive }) => {
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    if (!audioStream || !isActive) return

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaStreamSource(audioStream)
    source.connect(analyser)
    // Remova qualquer conexão ao audioContext.destination
    analyzerRef.current = analyser

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const analyze = () => {
      analyser.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength
      const volume = average / 255 // Normalize to 0-1
      onVolumeChange(volume)
      animationRef.current = requestAnimationFrame(analyze)
    }

    analyze()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      source.disconnect()
      analyser.disconnect()
      audioContext.close()
    }
  }, [audioStream, onVolumeChange, isActive])

  return null
}

export default AudioAnalyzer

