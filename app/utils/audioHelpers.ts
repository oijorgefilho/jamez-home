import { useState, useEffect, useRef, useCallback } from "react"

export function splitTextIntoChunks(text: string, maxChunkLength = 200): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || []
  const chunks: string[] = []
  let currentChunk = ""

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxChunkLength) {
      currentChunk += sentence
    } else {
      if (currentChunk) chunks.push(currentChunk.trim())
      currentChunk = sentence
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim())
  return chunks
}

export function useAudioQueue() {
  const [queue, setQueue] = useState<Blob[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0)
  const [isAllAudioFinished, setIsAllAudioFinished] = useState(true)
  const [shouldStopGeneration, setShouldStopGeneration] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentAudioUrlRef = useRef<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const playNext = useCallback(() => {
    if (queue.length > currentChunkIndex && !shouldStopGeneration) {
      setIsPlaying(true)
      const nextAudio = queue[currentChunkIndex]

      if (currentAudioUrlRef.current) {
        URL.revokeObjectURL(currentAudioUrlRef.current)
      }
      const audioUrl = URL.createObjectURL(nextAudio)
      currentAudioUrlRef.current = audioUrl

      if (!audioRef.current) {
        audioRef.current = new Audio()
      }
      audioRef.current.src = audioUrl
      audioRef.current
        .play()
        .then(() => {
          audioRef.current!.onended = () => {
            setIsPlaying(false)
            setCurrentChunkIndex((prevIndex) => prevIndex + 1)
          }
        })
        .catch((error) => {
          console.error("Error playing audio:", error)
          setIsPlaying(false)
          setCurrentChunkIndex((prevIndex) => prevIndex + 1)
        })
    } else if (currentChunkIndex >= queue.length && queue.length > 0) {
      setIsPlaying(false)
      setCurrentChunkIndex(0)
      setQueue([])
      setIsAllAudioFinished(true)
    }
  }, [queue, currentChunkIndex, shouldStopGeneration])

  const addToQueue = useCallback(
    (audioBlob: Blob) => {
      if (shouldStopGeneration) {
        return
      }
      setQueue((prevQueue) => [...prevQueue, audioBlob])
      setIsAllAudioFinished(false)
    },
    [shouldStopGeneration],
  )

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    if (currentAudioUrlRef.current) {
      URL.revokeObjectURL(currentAudioUrlRef.current)
      currentAudioUrlRef.current = null
    }
    setIsPlaying(false)
    setCurrentChunkIndex(0)
    setQueue([])
    setIsAllAudioFinished(true)
    setShouldStopGeneration(true)
  }, [])

  const clearQueue = useCallback(() => {
    stopPlayback()
    setQueue([])
    setCurrentChunkIndex(0)
    setIsAllAudioFinished(true)
    setShouldStopGeneration(true)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()
  }, [stopPlayback])

  const resetGeneration = useCallback(() => {
    setShouldStopGeneration(false)
    setIsAllAudioFinished(true)
    setQueue([])
    setCurrentChunkIndex(0)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()
  }, [])

  useEffect(() => {
    if (!isPlaying && queue.length > currentChunkIndex && !shouldStopGeneration) {
      playNext()
    }
  }, [isPlaying, queue, currentChunkIndex, playNext, shouldStopGeneration])

  return {
    addToQueue,
    isPlaying,
    stopPlayback,
    isAllAudioFinished,
    clearQueue,
    resetGeneration,
    shouldStopGeneration,
    abortControllerRef,
  }
}

