'use server'

import { createClient } from '@/lib/supabase/server'

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const supabase = createClient()

  if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured')
  }

  // Convert Blob to File
  const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' })

  // Upload the file to Supabase storage
  const { data, error } = await supabase.storage
    .from('audio-transcriptions')
    .upload(`transcription-${Date.now()}.webm`, file)

  if (error) {
    console.error('Error uploading file:', error)
    throw new Error('Failed to upload audio file')
  }

  // Get the public URL of the uploaded file
  const { data: { publicUrl } } = supabase.storage
    .from('audio-transcriptions')
    .getPublicUrl(data.path)

  // Call OpenAI Whisper API for transcription
  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      file: publicUrl,
      model: 'whisper-1'
    })
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error('OpenAI API Error:', errorData)
    throw new Error('Failed to transcribe audio')
  }

  const transcriptionData = await response.json()
  return transcriptionData.text
}

