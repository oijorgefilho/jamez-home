export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface AudioState {
  isListening: boolean
  isProcessing: boolean
}

export interface AudioStreamState {
  stream: MediaStream | null
  isActive: boolean
}

