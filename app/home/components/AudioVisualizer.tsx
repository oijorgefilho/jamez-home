'use client'

interface AudioVisualizerProps {
  isListening: boolean
  inputVolume: number
}

export function AudioVisualizer({ isListening, inputVolume }: AudioVisualizerProps) {
  return (
    <div className="w-full aspect-video bg-black rounded-3xl relative overflow-hidden flex items-center justify-center">
      <div 
        className={`w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 transition-all duration-300
          ${isListening ? 'scale-110 animate-pulse' : 'scale-100'}
        `}
        style={{
          transform: `scale(${1 + (inputVolume * 0.2)})`
        }}
      />
    </div>
  )
}

