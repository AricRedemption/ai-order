'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import type { AIMessage } from '@/types/ai';

interface ChatInterfaceProps {
  onOrderCreated?: (order: any) => void;
}

export function ChatInterface({ onOrderCreated }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '你好！我是 AI 交易助手。你可以通过文字或语音告诉我你想要的交易条件，比如："当 PEPE 价格低于 0.001 美元时买入 100 美元"',
      type: 'text',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send text message
  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      type: 'text',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      const storedConfig = localStorage.getItem('ai-meme-trader-config');
      
      if (!storedConfig) {
        throw new Error('请先在设置页面配置 AI 模型');
      }

      const config = JSON.parse(storedConfig);

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages
            .filter(m => m.role !== 'system')
            .map(m => ({ role: m.role, content: m.content }))
            .concat([{ role: 'user', content: input }]),
          config,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: AIMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.message,
          type: 'text',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);

        if (data.message.includes('订单') || data.message.includes('order')) {
          // Could trigger order creation here
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      const errorMessage: AIMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `抱歉，发生错误：${error instanceof Error ? error.message : '未知错误'}。请检查 AI 配置。`,
        type: 'text',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('无法访问麦克风。请检查浏览器权限。');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Process voice input
  const processVoiceInput = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      const storedConfig = localStorage.getItem('ai-meme-trader-config');
      
      if (!storedConfig) {
        alert('请先在设置页面配置 AI 模型');
        setIsProcessing(false);
        return;
      }
      
      const config = JSON.parse(storedConfig);

      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('action', 'transcribe');

      const transcribeResponse = await fetch('/api/ai/voice', {
        method: 'POST',
        headers: {
          'x-api-config': JSON.stringify(config),
        },
        body: formData,
      });

      const transcribeData = await transcribeResponse.json();

      if (transcribeData.success) {
        const transcribedText = transcribeData.text;

        const userMessage: AIMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: transcribedText,
          type: 'voice',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);

        const chatResponse = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(m => ({
              role: m.role,
              content: m.content,
            })),
            config,
          }),
        });

        const chatData = await chatResponse.json();

        if (chatData.success) {
          const aiMessage: AIMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: chatData.message,
            type: 'text',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, aiMessage]);
        }
      }
    } catch (error) {
      console.error('Voice processing error:', error);
      alert('语音处理失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  // Text to speech
  const speakMessage = async (text: string) => {
    setIsSpeaking(true);

    try {
      const storedKeys = localStorage.getItem('ai-meme-trader-api-keys');
      const apiKeys = storedKeys ? JSON.parse(storedKeys) : {};

      const formData = new FormData();
      formData.append('text', text);
      formData.append('action', 'tts');

      const response = await fetch('/api/ai/voice', {
        method: 'POST',
        headers: {
          'x-api-key': apiKeys.openai || '',
        },
        body: formData,
      });

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.play();
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
    }
  };

  return (
    <Card className="h-[calc(100vh-12rem)] sm:h-[600px] flex flex-col">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-base sm:text-lg">
          <span>AI 交易助手</span>
          <Badge variant="outline" className="text-xs w-fit">Claude + Whisper</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 pr-1 sm:pr-2 -mr-1 sm:-mr-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-3 py-2 sm:px-4 sm:py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.type === 'voice' && (
                    <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 sm:mt-1 flex-shrink-0" />
                  )}
                  <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.content}</p>
                </div>
                {message.role === 'assistant' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1.5 sm:mt-2 h-6 sm:h-7 px-2 text-xs"
                    onClick={() => speakMessage(message.content)}
                    disabled={isSpeaking}
                  >
                    <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                    朗读
                  </Button>
                )}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-secondary rounded-lg px-3 py-2 sm:px-4 sm:py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Recording indicator */}
        {isRecording && (
          <div className="text-center py-1">
            <Badge variant="destructive" className="animate-pulse text-xs">
              🔴 正在录音...
            </Badge>
          </div>
        )}

        {/* Input Area */}
        <div className="flex gap-2 pt-2 sm:pt-0 border-t sm:border-t-0">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder="输入消息..."
            disabled={isProcessing || isRecording}
            className="flex-1 text-sm sm:text-base h-9 sm:h-10"
          />

          <Button
            onClick={isRecording ? stopRecording : startRecording}
            variant={isRecording ? 'destructive' : 'outline'}
            size="icon"
            disabled={isProcessing}
            className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
          >
            {isRecording ? (
              <MicOff className="w-4 h-4 animate-pulse" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </Button>

          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isProcessing}
            size="icon"
            className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
