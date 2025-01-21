"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import { ToastProvider } from "@/components/ui/toast"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { ErrorBoundary } from "react-error-boundary"
import Header from "./components/Header"
import { StatusIndicator } from "./components/StatusIndicator"
import { ChatContainer } from "./components/ChatContainer"
import { RecordButton } from "./components/RecordButton"
import AudioAnalyzer from "./components/AudioAnalyzer"
import { splitTextIntoChunks, useAudioQueue } from "@/app/utils/audioHelpers"
import { IframeComponent } from "./components/IframeComponent"

const REACTION_GIF_URL = "https://jamez.pro/wp-content/uploads/2024/12/jamez-1-quieto.gif"
const AGENT_GIF_URL = "https://jamez.pro/wp-content/uploads/2024/12/jarvis.gif"
const SOUND_1_URL = "https://jamez.pro/wp-content/uploads/2024/12/james-sound1-1.mp3"
const SOUND_2_URL = "https://jamez.pro/wp-content/uploads/2024/12/james-sound2.mp3"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface AudioState {
  isListening: boolean
  isProcessing: boolean
  isAgentSpeaking: boolean
  error: string | null
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [audioState, setAudioState] = useState<AudioState>({
    isListening: false,
    isProcessing: false,
    isAgentSpeaking: false,
    error: null,
  })
  const [inputVolume, setInputVolume] = useState(0)

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

  const reactionGifRef = useRef<HTMLImageElement>(null)
  const agentGifRef = useRef<HTMLImageElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const addMessage = useCallback((newMessage: Message) => {
    setMessages((prevMessages) => [...prevMessages, newMessage].slice(-50))
  }, [])

  const playSound = useCallback(async (soundUrl: string) => {
    const audio = new Audio(soundUrl)
    await audio.play()
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)

      const chunks: Blob[] = []
      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" })
        await handleAudioTranscription(audioBlob)
      }

      mediaRecorderRef.current.start()
      setAudioState((prevState) => ({ ...prevState, isListening: true }))
    } catch (error) {
      console.error("Error starting recording:", error)
      toast({
        title: "Error",
        description: "Failed to start recording. Please check your microphone permissions.",
        variant: "destructive",
      })
    }
  }, [toast, playSound])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
      setAudioState((prevState) => ({ ...prevState, isListening: false, isProcessing: true }))
    }
  }, [])

  const handleAudioTranscription = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append("file", audioBlob, "audio.webm")
      formData.append("model", "whisper-1")

      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to transcribe audio")
      }

      const data = await response.json()
      const transcription = data.text

      addMessage({ role: "user", content: transcription })
      await handleJamezResponse(transcription)
    } catch (error) {
      console.error("Error transcribing audio:", error)
      toast({
        title: "Error",
        description: "Failed to transcribe audio. Please try again.",
        variant: "destructive",
      })
      setAudioState((prevState) => ({ ...prevState, isProcessing: false }))
    }
  }

  const handleJamezResponse = async (transcription: string) => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_JAMEZ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: transcription,
          userEmail: process.env.NEXT_PUBLIC_DEFAULT_USER_EMAIL || "",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get Jamez response")
      }

      const jamezResponse = await response.text()
      addMessage({ role: "assistant", content: jamezResponse })
      await generateAndPlayAudioResponse(jamezResponse)
    } catch (error) {
      console.error("Error getting Jamez response:", error)
      toast({
        title: "Error",
        description: "Failed to get Jamez response. Please try again.",
        variant: "destructive",
      })
      setAudioState((prevState) => ({ ...prevState, isProcessing: false }))
    }
  }

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
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.blob()
      }

      for (const chunk of chunks) {
        const audioBlob = await generateAudioChunk(chunk)
        addToQueue(audioBlob)
      }
    } catch (error) {
      console.error("Error in generateAndPlayAudioResponse:", error)
      setAudioState((prevState) => ({
        ...prevState,
        error: "Erro ao gerar áudio. Por favor, tente novamente.",
        isAgentSpeaking: false,
        isProcessing: false,
      }))
    }
  }

  const handleToggleRecording = async () => {
    if (!audioState.isListening && !audioState.isProcessing) {
      await startRecording()
    } else if (audioState.isListening) {
      stopRecording()
      setAudioState((prevState) => ({ ...prevState, isProcessing: true }))
    }
  }

  const detectSilence = useCallback(() => {
    if (!analyserRef.current) return

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyserRef.current.getByteFrequencyData(dataArray)

    const maxVolume = Math.max(...dataArray)
    const threshold = 80
    const silenceDelay = 3000

    const baseScale = 1.6 // Reduced base scale for smaller initial size

    if (maxVolume < threshold) {
      if (!silenceTimeoutRef.current) {
        silenceTimeoutRef.current = setTimeout(() => {
          stopRecording()
        }, silenceDelay)
      }
    } else {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
        silenceTimeoutRef.current = null
      }
    }

    if (reactionGifRef.current) {
      const dynamicScale = 1 + (maxVolume / 255) * 0.2
      reactionGifRef.current.style.transform = `scale(${baseScale * dynamicScale})`
    }

    requestAnimationFrame(detectSilence)
  }, [stopRecording])

  useEffect(() => {
    if (audioState.isListening) {
      detectSilence()
    }
    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }
    }
  }, [audioState.isListening, detectSilence])

  useEffect(() => {
    if (!isPlaying && isAllAudioFinished) {
      setAudioState((prevState) => ({
        ...prevState,
        isAgentSpeaking: false,
        isProcessing: false,
      }))
      playSound(SOUND_2_URL)
    }
  }, [isPlaying, isAllAudioFinished, playSound])

  useEffect(() => {
    if (audioState.isProcessing && !audioState.isListening && !isPlaying) {
      playSound(SOUND_1_URL)
    }
  }, [audioState.isProcessing, audioState.isListening, isPlaying, playSound])

  useEffect(() => {
    const unlockAudioContext = () => {
      if (audioContextRef.current && audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume()
      }
      document.removeEventListener("touchstart", unlockAudioContext)
      document.removeEventListener("click", unlockAudioContext)
    }

    document.addEventListener("touchstart", unlockAudioContext)
    document.addEventListener("click", unlockAudioContext)

    return () => {
      document.removeEventListener("touchstart", unlockAudioContext)
      document.removeEventListener("click", unlockAudioContext)
    }
  }, [])

  return (
    <ErrorBoundary fallback={<div>Algo deu errado. Por favor, recarregue a página.</div>}>
      <ToastProvider>
        <div className="min-h-screen w-full bg-gradient-to-br from-[#0D1317] via-[#0A0F12] to-[#07090B] flex flex-col items-center overflow-x-hidden">
          <Header />

          <div className="w-full max-w-md px-2 sm:px-4 flex-1 flex flex-col gap-4 sm:gap-6">
            <div className="relative w-full max-w-[500px] aspect-video mx-auto">
              <div className="relative w-full h-full">
                <Image
                  ref={reactionGifRef}
                  src={REACTION_GIF_URL || "/placeholder.svg"}
                  alt="User Reaction"
                  layout="fill"
                  objectFit="contain"
                  className={`transition-opacity duration-300 ${isPlaying ? "opacity-0" : "opacity-100"}`}
                />
                <Image
                  ref={agentGifRef}
                  src={AGENT_GIF_URL || "/placeholder.svg"}
                  alt="Agent Speaking"
                  layout="fill"
                  objectFit="contain"
                  className={`transition-opacity duration-300 ${isPlaying ? "opacity-100" : "opacity-0"}`}
                />
              </div>
            </div>
            <StatusIndicator />
            <ChatContainer messages={messages} />

            <div className="w-full pb-4 sm:pb-6">
              <RecordButton
                isListening={audioState.isListening}
                isProcessing={audioState.isProcessing || isPlaying}
                onClick={handleToggleRecording}
              />
            </div>
            <div className="w-full max-w-md mx-auto mt-4 sm:mt-6 px-4">
              <IframeComponent />
            </div>
          </div>

          <AudioAnalyzer audioStream={null} onVolumeChange={setInputVolume} isActive={audioState.isListening} />
          <Toaster />
        </div>
      </ToastProvider>
    </ErrorBoundary>
  )
}

