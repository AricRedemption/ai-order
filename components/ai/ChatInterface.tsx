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
    if (messagesEndRef.current?.parentElement) {
      const scrollContainer = messagesEndRef.current.parentElement;
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
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
    <Card className="h-[calc(100vh-12rem)] sm:h-[600px] flex flex-col shadow-lg border-muted/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <CardHeader className="border-b px-4 py-3 sm:px-6 sm:py-4">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <div className="p-2 bg-primary/10 rounded-lg">
            <span className="text-xl">🤖</span>
          </div>
          <div className="flex flex-col">
            <span>AI 交易助手</span>
            <span className="text-xs font-normal text-muted-foreground">基于 Claude + Whisper</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-muted/50 text-foreground rounded-bl-none border border-border/50'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.type === 'voice' && (
                    <Mic className="w-4 h-4 mt-1 flex-shrink-0 opacity-70" />
                  )}
                  <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                </div>
                
                <div className={`flex items-center gap-2 mt-2 ${message.role === 'user' ? 'justify-end text-primary-foreground/70' : 'justify-between text-muted-foreground'}`}>
                  <span className="text-[10px]">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  
                  {message.role === 'assistant' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-background/50"
                      onClick={() => speakMessage(message.content)}
                      disabled={isSpeaking}
                      title="朗读"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-muted/50 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">正在思考...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
            <Badge variant="destructive" className="animate-pulse shadow-lg px-4 py-1.5 rounded-full flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              正在录音...
            </Badge>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
          <div className="flex gap-2">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? 'destructive' : 'outline'}
              size="icon"
              disabled={isProcessing}
              className={`h-11 w-11 rounded-full flex-shrink-0 transition-all duration-300 ${isRecording ? 'scale-110 shadow-red-500/20 shadow-lg' : 'hover:bg-muted'}`}
            >
              {isRecording ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </Button>

            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="输入消息..."
                disabled={isProcessing || isRecording}
                className="h-11 rounded-full pl-4 pr-12 shadow-sm bg-background/80 focus-visible:ring-primary/20"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isProcessing}
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1 h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
