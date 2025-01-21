"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import { splitTextIntoChunks, useAudioQueue } from "@/app/utils/audioHelpers"

interface AudioState {
  isListening: boolean
  isProcessing: boolean
  isAgentSpeaking: boolean
  error: string | null
}

export default function Home() {
  const [audioState, setAudioState] = useState<AudioState>({
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

  const generateAndPlayAudioResponse = useCallback(
    async (aiResponse: string) => {
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
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          return await response.blob()
        }

        for (let i = 0; i < Math.min(2, chunks.length); i++) {
          const audioBlob = await generateAudioChunk(chunks[i])
          addToQueue(audioBlob)
        }
        ;(async () => {
          for (let i = 2; i < chunks.length; i++) {
            const audioBlob = await generateAudioChunk(chunks[i])
            addToQueue(audioBlob)
          }
        })()
      } catch (error) {
        setAudioState((prevState) => ({
          ...prevState,
          error: "Erro ao gerar áudio. Por favor, tente novamente.",
          isAgentSpeaking: false,
          isProcessing: false,
        }))
      }
    },
    [addToQueue],
  )

  // Rest of the component logic...

  return <div>{/* Component JSX */}</div>
}

