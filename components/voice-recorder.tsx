'use client'

import { useState, useRef, useCallback, useImperativeHandle, forwardRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useReactMediaRecorder } from 'react-media-recorder'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'

interface VoiceRecorderProps {
  onStartRecording: () => void;
  onStopRecording: (audioBlob: Blob | null) => void;
  stopAudioPlayback: () => void;
  isListening: boolean;
  isProcessing: boolean;
}

const VoiceRecorder = forwardRef<{ resetButtonState: () => void }, VoiceRecorderProps>(
  ({ onStartRecording, onStopRecording, stopAudioPlayback, isListening, isProcessing }, ref) => {
    const { toast } = useToast()
    const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null)
    const [isRecordingTooLong, setIsRecordingTooLong] = useState(false)

    const {
      status,
      startRecording,
      stopRecording,
      mediaBlobUrl,
    } = useReactMediaRecorder({
      audio: true,
      video: false,
      blobPropertyBag: { type: 'audio/wav' },
      onStart: () => {
        console.log('Recording started');
        setRecordingStartTime(Date.now());
        setIsRecordingTooLong(false);
        onStartRecording();
      },
      onStop: (blobUrl, blob) => {
        console.log('Recording stopped, blob size:', blob.size);
        onStopRecording(blob);
      },
      onError: (error) => {
        console.error('Error during recording:', error);
        toast({
          variant: "destructive",
          title: "Erro na Gravação",
          description: "Ocorreu um erro durante a gravação. Por favor, tente novamente."
        });
      },
    });

    const handleToggleRecording = async () => {
      console.log('handleToggleRecording called');
      if (!isListening && !isProcessing) {
        console.log('Starting recording');
        stopAudioPlayback();
        startRecording();
      } else if (isListening) {
        console.log('Stopping recording');
        stopRecording();
        onStopRecording(null);
      }
    }

    useEffect(() => {
      let timer: NodeJS.Timeout;
      if (recordingStartTime && !isRecordingTooLong && isListening) {
        timer = setInterval(() => {
          const duration = Date.now() - recordingStartTime;
          if (duration > 60000) { // 60 seconds
            setIsRecordingTooLong(true);
            stopRecording();
            toast({
              variant: "warning",
              title: "Gravação muito longa",
              description: "A gravação foi interrompida porque excedeu 60 segundos.",
            });
          }
        }, 1000);
      }
      return () => {
        if (timer) clearInterval(timer);
      };
    }, [recordingStartTime, stopRecording, toast, isRecordingTooLong, isListening]);

    useEffect(() => {
      if (!isProcessing) {
        setRecordingStartTime(null);
        setIsRecordingTooLong(false);
      }
    }, [isProcessing]);

    const resetButtonState = useCallback(() => {
      console.log('Resetting button state');
      if (status === 'recording') {
        stopRecording();
      }
      setIsRecordingTooLong(false);
    }, [status, stopRecording])

    useImperativeHandle(ref, () => ({
      resetButtonState
    }))

    const getButtonContent = () => {
      if (isProcessing) {
        return (
          <>
            <Loader2 className="h-10 w-10 animate-spin absolute left-4" />
            <span className="flex-grow text-center text-lg sm:text-xl">Processando...</span>
          </>
        );
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
        );
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
        );
      }
    };

    return (
      <Button 
        onClick={handleToggleRecording}
        disabled={isProcessing}
        isListening={isListening}
        isProcessing={isProcessing}
        className="w-full py-5 sm:py-7 text-lg sm:text-xl relative flex items-center justify-center px-4 font-semibold transition-colors duration-300"
      >
        {getButtonContent()}
      </Button>
    )
  }
)

VoiceRecorder.displayName = 'VoiceRecorder'

export default VoiceRecorder

