// AI message types
export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageType = 'text' | 'voice';

export interface AIMessage {
  id: string;
  role: MessageRole;
  content: string;
  type: MessageType;
  timestamp: Date;
  audioUrl?: string; // For voice messages
}

// AI chat request
export interface ChatRequest {
  messages: AIMessage[];
  useAnthropic?: boolean; // true = Anthropic, false = OpenAI
  systemPrompt?: string;
}

// AI chat response
export interface ChatResponse {
  message: string;
  audioUrl?: string; // TTS audio if requested
  suggestedActions?: SuggestedAction[];
}

// Suggested actions from AI
export type ActionType = 'create_order' | 'buy_token' | 'view_token' | 'cancel_order';

export interface SuggestedAction {
  type: ActionType;
  label: string;
  data: any; // Action-specific data
}

// Voice processing
export interface VoiceTranscription {
  text: string;
  language?: string;
  confidence?: number;
}

export interface TTSRequest {
  text: string;
  voice?: string; // Voice ID for TTS
}
