"use client"

import { forwardRef } from "react"
import Image from "next/image"

interface RecordButtonProps {
  isListening: boolean
  isProcessing: boolean
  isBlocked: boolean
  onClick: () => void
}

export const RecordButton = forwardRef<HTMLButtonElement, RecordButtonProps>(
  ({ isListening, isProcessing, isBlocked, onClick }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={`w-full h-[70px] sm:h-[80px] px-[12px] sm:px-[14px] py-[14px] sm:py-[18px] flex items-center gap-[30px] sm:gap-[60px] self-stretch rounded-[40px] sm:rounded-[49px] transition-colors duration-300 ${
          isBlocked
            ? "bg-gray-500 cursor-not-allowed"
            : isProcessing
              ? "bg-gradient-to-r from-[#26A027] to-[#0E3A0E] opacity-70 cursor-not-allowed"
              : isListening
                ? "bg-gradient-to-r from-[#F22116] to-[#591815]"
                : "bg-gradient-to-r from-[#26A027] to-[#0E3A0E]"
        } text-white relative`}
        disabled={isBlocked || isProcessing}
      >
        {isBlocked ? (
          <span className="flex-grow text-center text-base sm:text-lg">Créditos Esgotados</span>
        ) : isProcessing ? (
          <>
            <svg className="animate-spin h-5 w-5 absolute left-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="flex-grow text-center text-base sm:text-lg">Processando...</span>
          </>
        ) : isListening ? (
          <>
            <Image
              src="https://jamez.pro/wp-content/uploads/2025/01/ouvindo-icon-jamez.webp"
              alt="Ouvindo"
              width={40}
              height={40}
              className="absolute left-3 sm:left-4"
            />
            <span className="flex-grow text-center text-base sm:text-lg">Parar Gravação</span>
          </>
        ) : (
          <>
            <Image
              src="https://jamez.pro/wp-content/uploads/2025/01/mic-icon-jamez.webp"
              alt="Microfone"
              width={40}
              height={40}
              className="absolute left-3 sm:left-4"
            />
            <span className="flex-grow text-center text-base sm:text-lg">Enviar Áudio</span>
          </>
        )}
      </button>
    )
  },
)

RecordButton.displayName = "RecordButton"

