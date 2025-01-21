export async function getJamezResponse(transcription: string, userEmail?: string): Promise<string> {
  console.log('Iniciando requisição para a API do Jamez com a transcrição:', transcription)
  try {
    console.log('Preparando para enviar requisição POST para:', 'https://n8n.jamez.pro/webhook/cd219d1b-b665-4371-8878-60b1f709da9d')
    const response = await fetch('https://n8n.jamez.pro/webhook/cd219d1b-b665-4371-8878-60b1f709da9d', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcription, userEmail })
    })

    console.log('Resposta recebida. Status:', response.status)
    console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()))
    
    const responseText = await response.text()
    console.log('Texto da resposta:', responseText)

    if (!response.ok) {
      throw new Error(`Falha ao obter resposta do Jamez: ${response.status} - ${responseText}`)
    }

    return responseText.trim()
  } catch (error) {
    console.error('Erro em getJamezResponse:', error)
    throw error
  }
}

