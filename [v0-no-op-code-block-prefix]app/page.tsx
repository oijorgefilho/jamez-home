"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useTheme } from "next-themes"
import Image from "next/image"
import dynamic from "next/dynamic"
import { Card, CardContent } from "@/components/ui/card"
import { ToastProvider } from "@/components/ui/toast"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { ErrorBoundary } from "react-error-boundary"
import { splitTextIntoChunks, useAudioQueue } from "@/app/utils/audioHelpers"

// Dynamically import VoiceRecorder component
const VoiceRecorder = dynamic(() => import("@/components/voice-recorder"), {
  ssr: false,
})

export default function Home() {
  const [audioState, setAudioState] = useState({
    isListening: false,
    isProcessing: false,
    isAgentSpeaking: false,
    error: null,
  })

  const { toast } = useToast()
  const {
    addToQueue,
    isPlaying,
    stopPlayback,
    isAllAudioFinished,
    clearQueue,
    resetGeneration,
    shouldStopGeneration,
    abortControllerRef,
  } = useAudioQueue()

  const generateAndPlayAudioResponse = async (aiResponse: string) => {
    try {
      const chunks = splitTextIntoChunks(aiResponse)
      setAudioState((prevState) => ({
        ...prevState,
        isAgentSpeaking: true,
        isProcessing: false,
      }))

      const generateAudioChunk = async (chunk: string) => {
        const response = await fetch("https://api.openai.com/v1/audio/speech", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "tts-1",
            input: chunk,
            voice: "echo",
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("OpenAI TTS API Error:", errorText)
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }

        return await response.blob()
      }

      // Generate and play the first two chunks immediately
      for (let i = 0; i < Math.min(2, chunks.length); i++) {
        const audioBlob = await generateAudioChunk(chunks[i])
        addToQueue(audioBlob)
      }
      // Generate the remaining chunks in the background
      ;(async () => {
        for (let i = 2; i < chunks.length; i++) {
          const audioBlob = await generateAudioChunk(chunks[i])
          addToQueue(audioBlob)
        }
      })()
    } catch (error) {
      console.error("Error in generateAndPlayAudioResponse:", error)
      setAudioState((prevState) => ({ ...prevState, error: "Erro ao gerar áudio. Por favor, tente novamente." }))
      throw error
    }
  }

  useEffect(() => {
    if (!isPlaying) {
      setAudioState((prevState) => ({
        ...prevState,
        isAgentSpeaking: false,
      }))
    }
  }, [isPlaying])

  // ... (keep the rest of the component, including JSX)

  return (
    <ErrorBoundary fallback={<div>Algo deu errado. Por favor, recarregue a página.</div>}>
      <ToastProvider>{/* Your JSX here */}</ToastProvider>
    </ErrorBoundary>
  )
}

