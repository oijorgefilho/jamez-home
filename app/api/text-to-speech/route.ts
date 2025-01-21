import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  console.log('text-to-speech API: Received request');
  try {
    const { text } = await req.json();

    if (!text) {
      console.error('text-to-speech API: No text provided');
      return new NextResponse('Text is required', { status: 400 });
    }

    console.log('text-to-speech API: Generating speech for text:', text);

    if (!process.env.OPENAI_API_KEY) {
      console.error('text-to-speech API: OPENAI_API_KEY is not set');
      throw new Error('OPENAI_API_KEY is not set');
    }

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "echo",
      input: text,
    });

    console.log('text-to-speech API: Speech generated successfully');

    const buffer = Buffer.from(await mp3.arrayBuffer());

    if (buffer.length === 0) {
      console.error('text-to-speech API: Generated audio buffer is empty');
      throw new Error('Generated audio buffer is empty');
    }

    console.log('text-to-speech API: Returning audio buffer, size:', buffer.length);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    console.error('text-to-speech API: Error generating speech:', error);
    let errorMessage = 'Failed to generate speech';
    if (error instanceof Error) {
      errorMessage += ': ' + error.message;
    }
    return new NextResponse(errorMessage, { status: 500 });
  }
}

