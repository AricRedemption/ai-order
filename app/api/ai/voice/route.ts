import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio, textToSpeech } from '@/lib/ai/voiceProcessor';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const action = formData.get('action') as string;
    const apiKey = request.headers.get('x-api-key') || undefined;

    if (action === 'transcribe') {
      // Transcribe audio to text
      const audioFile = formData.get('audio') as Blob;
      if (!audioFile) {
        return NextResponse.json(
          { success: false, error: 'No audio file provided' },
          { status: 400 }
        );
      }

      const transcription = await transcribeAudio(audioFile, apiKey);

      return NextResponse.json({
        success: true,
        text: transcription.text,
        language: transcription.language,
      });
    } else if (action === 'tts') {
      // Text to speech
      const text = formData.get('text') as string;
      if (!text) {
        return NextResponse.json(
          { success: false, error: 'No text provided' },
          { status: 400 }
        );
      }

      const audioBlob = await textToSpeech({ text }, apiKey);

      // Return audio as response
      return new NextResponse(audioBlob, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Disposition': 'attachment; filename="tts.mp3"',
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[API] Voice error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Voice processing failed',
      },
      { status: 500 }
    );
  }
}
