'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, Save, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const [showKeys, setShowKeys] = useState(false);
  const [anthropicKey, setAnthropicKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai-meme-trader-api-keys', JSON.stringify({
        anthropic: anthropicKey,
        openai: openaiKey,
      }));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  React.useEffect(() => {
    // Load from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ai-meme-trader-api-keys');
      if (stored) {
        const keys = JSON.parse(stored);
        setAnthropicKey(keys.anthropic || '');
        setOpenaiKey(keys.openai || '');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Configure your API keys and preferences
          </p>
        </div>

        {/* API Keys Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  API Keys
                </CardTitle>
                <CardDescription className="mt-2">
                  Your API keys are stored locally in your browser and never sent to our servers
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowKeys(!showKeys)}
              >
                {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Anthropic API Key */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                Anthropic API Key
                <Badge variant="default">Recommended</Badge>
              </label>
              <Input
                type={showKeys ? 'text' : 'password'}
                placeholder="sk-ant-..."
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Get your API key from{' '}
                <a
                  href="https://console.anthropic.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  console.anthropic.com
                </a>
              </p>
            </div>

            {/* OpenAI API Key */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                OpenAI API Key
                <Badge variant="secondary">For Voice & Alternative AI</Badge>
              </label>
              <Input
                type={showKeys ? 'text' : 'password'}
                placeholder="sk-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Get your API key from{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  platform.openai.com/api-keys
                </a>
              </p>
            </div>

            <Button onClick={handleSave} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {saved ? 'Saved!' : 'Save API Keys'}
            </Button>
          </CardContent>
        </Card>

        {/* Chain Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Chain Preferences</CardTitle>
            <CardDescription>
              Default chain and RPC settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Solana RPC URL</label>
              <Input
                type="text"
                placeholder="https://api.mainnet-beta.solana.com"
                defaultValue="https://api.mainnet-beta.solana.com"
                disabled
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">BNB Chain RPC URL</label>
              <Input
                type="text"
                placeholder="https://bsc-dataseed.binance.org"
                defaultValue="https://bsc-dataseed.binance.org"
                disabled
              />
            </div>

            <p className="text-xs text-muted-foreground">
              RPC endpoints are currently read-only. Custom RPCs coming soon.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
