"use client"

import { useEffect, useRef } from "react"

export function IframeComponent() {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const handleResize = () => {
      if (iframeRef.current) {
        const width = Math.min(iframeRef.current.offsetWidth, 375) // Max width of 375px
        const height = width * 2 // 2:1 aspect ratio
        iframeRef.current.style.height = `${height}px`
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize() // Initial resize

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="w-full max-w-[375px] mx-auto overflow-hidden rounded-lg shadow-lg">
      <iframe
        ref={iframeRef}
        src="https://m.reals.bet.br/signup"
        width="100%"
        height="100%"
        className="border-0"
        style={{
          maxWidth: "100%",
          overflow: "auto",
        }}
      />
    </div>
  )
}

