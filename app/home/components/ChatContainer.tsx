"use client"

import { useEffect, useRef, useState } from "react"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface ChatContainerProps {
  messages: Message[]
}

export function ChatContainer({ messages }: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const backgroundRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="h-[350px] sm:h-[400px] min-h-[120px] bg-[#0D0F1A] rounded-2xl sm:rounded-3xl p-3 sm:p-4 relative overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('https://jamez.pro/wp-content/uploads/2025/01/Untitled-design-34.png')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="relative h-full overflow-y-auto space-y-4 pr-2 z-10">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] sm:max-w-[80%] rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 ${
                message.role === "user" ? "bg-gray-700/50 text-white" : "bg-blue-600 text-white"
              }`}
            >
              {message.role === "user" && <span className="text-xs font-medium block mb-1">Você:</span>}
              {message.role === "assistant" && <span className="text-xs font-medium block mb-1">Jamez:</span>}
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <style jsx>{`
        .overflow-y-auto {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
      `}</style>
    </div>
  )
}

