"use client"

import { useState, useRef, useCallback, useImperativeHandle, forwardRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useReactMediaRecorder } from "react-media-recorder"
import Image from "next/image"
import { Loader2 } from "lucide-react"

interface VoiceRecorderProps {
  onStartRecording: () => void
  onStopRecording: (audioBlob: Blob | null) => void
  stopAudioPlayback: () => void
  isListening: boolean
  isProcessing: boolean
}

const VoiceRecorder = forwardRef<HTMLButtonElement, VoiceRecorderProps>(
  ({ onStartRecording, onStopRecording, stopAudioPlayback, isListening, isProcessing }, ref) => {
    const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({
      audio: true,
      video: false,
      blobPropertyBag: { type: "audio/wav" },
      onStart: () => {
        console.log("Recording started")
        onStartRecording()
      },
      onStop: (blobUrl, blob) => {
        console.log("Recording stopped, blob size:", blob.size)
        onStopRecording(blob)
      },
    })

    const audioContextRef = useRef<AudioContext | null>(null)
    const audioBufferRef = useRef<AudioBuffer | null>(null)

    const { toast } = useToast()

    useEffect(() => {
      const loadAudio = async () => {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          audioContextRef.current = audioContext

          const response = await fetch("https://jamez.pro/wp-content/uploads/2024/12/james-sound2.mp3")
          const arrayBuffer = await response.arrayBuffer()
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
          audioBufferRef.current = audioBuffer
          console.log("Áudio carregado com sucesso")
        } catch (error) {
          console.error("Erro ao carregar o áudio:", error)
        }
      }

      loadAudio()

      return () => {
        if (audioContextRef.current) {
          audioContextRef.current.close()
        }
      }
    }, [])

    useEffect(() => {
      if (!audioContextRef.current || !audioBufferRef.current) {
        toast({
          title: "Aviso",
          description: "Não foi possível carregar o efeito sonoro. Verifique sua conexão com a internet.",
          variant: "destructive",
        })
      }
    }, [toast])

    const handleToggleRecording = async () => {
      if (!isListening && !isProcessing) {
        stopAudioPlayback()
        startRecording()
      } else if (isListening) {
        try {
          if (audioContextRef.current && audioBufferRef.current) {
            const source = audioContextRef.current.createBufferSource()
            source.buffer = audioBufferRef.current
            source.connect(audioContextRef.current.destination)
            source.start()
            console.log("Reproduzindo efeito sonoro")
          } else {
            console.error("AudioContext ou AudioBuffer não estão prontos")
          }
        } catch (error) {
          console.error("Erro ao reproduzir o efeito sonoro:", error)
        }
        stopRecording()
      }
    }

    const getButtonContent = () => {
      if (isProcessing) {
        return (
          <>
            <Loader2 className="h-10 w-10 animate-spin absolute left-4" />
            <span className="flex-grow text-center text-lg sm:text-xl">Processando...</span>
          </>
        )
      } else if (isListening) {
        return (
          <>
            <Image
              src="https://jamez.pro/wp-content/uploads/2025/01/ouvindo-icon-jamez.webp"
              alt="Ouvindo"
              width={40}
              height={40}
              className="absolute left-4"
            />
            <span className="flex-grow text-center text-lg sm:text-xl">Ouvindo/Parar...</span>
          </>
        )
      } else {
        return (
          <>
            <Image
              src="https://jamez.pro/wp-content/uploads/2025/01/mic-icon-jamez.webp"
              alt="Microfone"
              width={40}
              height={40}
              className="absolute left-4"
            />
            <span className="flex-grow text-center text-lg sm:text-xl">Enviar Áudio</span>
          </>
        )
      }
    }

    return (
      <Button
        ref={ref}
        onClick={handleToggleRecording}
        disabled={isProcessing}
        isListening={isListening}
        isProcessing={isProcessing}
        className="w-full py-5 sm:py-7 text-lg sm:text-xl relative flex items-center justify-center px-4 font-semibold transition-colors duration-300"
      >
        {getButtonContent()}
      </Button>
    )
  },
)

VoiceRecorder.displayName = "VoiceRecorder"

export default VoiceRecorder

