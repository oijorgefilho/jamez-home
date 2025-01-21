'use server'

export async function transcribeAudio(base64Audio: string): Promise<string> {
  console.log('Iniciando transcrição do áudio...');

  if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    const audioBuffer = Buffer.from(base64Audio, 'base64');
    const formData = new FormData();
    formData.append('file', new Blob([audioBuffer], { type: 'audio/webm' }), 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'pt');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error('Failed to transcribe audio');
    }

    const transcriptionData = await response.json();
    console.log('Transcrição concluída:', transcriptionData.text);
    
    // Check if the transcription is empty or just whitespace
    if (!transcriptionData.text || transcriptionData.text.trim() === '') {
      console.log('Transcrição vazia ou não reconhecida');
      return '';
    }
    
    return transcriptionData.text;
  } catch (error) {
    console.error('Erro na transcrição:', error);
    throw error;
  }
}

