import OpenAI from 'openai';
import { WHISPER_MODEL, TTS_MODEL, TTS_VOICE } from '@/config/constants';
import type { VoiceTranscription, TTSRequest, AIConfig } from '@/types/ai';

const voiceClients = new Map<string, OpenAI>();

function getVoiceClient(config: AIConfig): OpenAI {
  const cacheKey = `${config.apiKey}:${config.baseURL || 'default'}`;
  
  if (!voiceClients.has(cacheKey)) {
    const clientOptions: any = { apiKey: config.apiKey };
    
    if (config.baseURL) {
      clientOptions.baseURL = config.baseURL;
    }
    
    voiceClients.set(cacheKey, new OpenAI(clientOptions));
  }
  
  return voiceClients.get(cacheKey)!;
}

export async function transcribeAudio(
  audioBlob: Blob,
  config: AIConfig
): Promise<VoiceTranscription> {
  try {
    const client = getVoiceClient(config);

    const audioFile = new File([audioBlob], 'audio.webm', { type: audioBlob.type });

    const transcription = await client.audio.transcriptions.create({
      file: audioFile,
      model: WHISPER_MODEL,
      language: 'zh',
    });

    return {
      text: transcription.text,
      language: 'zh',
    };
  } catch (error) {
    console.error('[Voice] Transcription error:', error);
    throw new Error('Failed to transcribe audio');
  }
}

export async function textToSpeech(
  request: TTSRequest,
  config: AIConfig
): Promise<Blob> {
  try {
    const client = getVoiceClient(config);

    const response = await client.audio.speech.create({
      model: TTS_MODEL,
      voice: (request.voice as any) || TTS_VOICE,
      input: request.text,
    });

    const arrayBuffer = await response.arrayBuffer();
    return new Blob([arrayBuffer], { type: 'audio/mpeg' });
  } catch (error) {
    console.error('[Voice] TTS error:', error);
    throw new Error('Failed to generate speech');
  }
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async start(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
    } catch (error) {
      console.error('[AudioRecorder] Start error:', error);
      throw new Error('Failed to start audio recording');
    }
  }

  async stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.cleanup();
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}
