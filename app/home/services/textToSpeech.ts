'use client'

export async function generateSpeech(text: string): Promise<ArrayBuffer> {
  console.log('generateSpeech: Starting speech generation for text:', text);
  try {
    const response = await fetch('/api/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    console.log('generateSpeech: Received response from API');

    if (!response.ok) {
      const errorText = await response.text();
      console.error('generateSpeech: Speech generation API error:', errorText);
      throw new Error(`Failed to generate speech: ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log('generateSpeech: Successfully generated speech, buffer size:', arrayBuffer.byteLength);
    return arrayBuffer;
  } catch (error) {
    console.error('generateSpeech: Error in speech generation:', error);
    throw error;
  }
}

