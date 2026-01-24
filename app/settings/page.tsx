'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, Save, Eye, EyeOff, Check } from 'lucide-react';
import { PRESET_PROVIDERS } from '@/lib/ai/client';
import type { AIConfig } from '@/types/ai';

const STORAGE_KEY = 'ai-meme-trader-config';

export default function SettingsPage() {
  const [showKey, setShowKey] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState('anthropic-official');
  const [apiKey, setApiKey] = useState('');
  const [customBaseURL, setCustomBaseURL] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [saved, setSaved] = useState(false);

  const selectedProvider = PRESET_PROVIDERS.find(p => p.id === selectedProviderId);
  const isCustom = selectedProviderId === 'custom';

  const handleSave = () => {
    const config: AIConfig = {
      provider: selectedProvider?.provider || 'openai',
      apiKey,
      baseURL: isCustom ? customBaseURL : selectedProvider?.baseURL || undefined,
      model: isCustom ? customModel : selectedProvider?.defaultModel,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const config: AIConfig = JSON.parse(stored);
      setApiKey(config.apiKey || '');
      
      if (config.baseURL) {
        const matchingProvider = PRESET_PROVIDERS.find(p => p.baseURL === config.baseURL);
        if (matchingProvider) {
          setSelectedProviderId(matchingProvider.id);
        } else {
          setSelectedProviderId('custom');
          setCustomBaseURL(config.baseURL);
        }
      }
      
      if (config.model && isCustom) {
        setCustomModel(config.model);
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
            Configure your AI model and API settings
          </p>
        </div>

        {/* AI Configuration */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  AI Model Configuration
                </CardTitle>
                <CardDescription className="mt-2">
                  Choose your AI model provider and enter your API key
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Provider Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Select AI Provider</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => setSelectedProviderId(provider.id)}
                    className={`
                      relative p-4 text-left rounded-lg border-2 transition-all
                      ${selectedProviderId === provider.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                  >
                    {selectedProviderId === provider.id && (
                      <Check className="absolute top-3 right-3 w-5 h-5 text-primary" />
                    )}
                    <div className="font-medium text-sm">{provider.name}</div>
                    {!isCustom && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {provider.provider === 'anthropic' ? 'Anthropic 协议' : 'OpenAI 兼容协议'}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Base URL */}
            {isCustom && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Base URL</label>
                <Input
                  type="text"
                  placeholder="https://api.example.com/v1"
                  value={customBaseURL}
                  onChange={(e) => setCustomBaseURL(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  输入自定义的 API Base URL（支持 OpenAI 兼容协议）
                </p>
              </div>
            )}

            {/* Custom Model */}
            {isCustom && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Model Name</label>
                <Input
                  type="text"
                  placeholder="e.g., gpt-4, claude-3-5-sonnet"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  输入要使用的模型名称
                </p>
              </div>
            )}

            {/* API Key */}
            <div className="space-y-2">
              <label className="text-sm font-medium">API Key</label>
              <Input
                type={showKey ? 'text' : 'password'}
                placeholder={selectedProvider?.provider === 'anthropic' ? 'sk-ant-...' : 'sk-...'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              {selectedProviderId === 'anthropic-official' && (
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
              )}
              {selectedProviderId === 'openai-official' && (
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
              )}
              {selectedProviderId === 'zhipu-openai' && (
                <p className="text-xs text-muted-foreground">
                  Get your API key from{' '}
                  <a
                    href="https://open.bigmodel.cn/usercenter/apikeys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    open.bigmodel.cn/usercenter/apikeys
                  </a>
                </p>
              )}
              {selectedProviderId === 'minimax-openai' && (
                <p className="text-xs text-muted-foreground">
                  Get your API key from{' '}
                  <a
                    href="https://www.minimaxi.com/user-center/basic-information/interface-key"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    minimaxi.com
                  </a>
                </p>
              )}
            </div>

            {/* Provider Info */}
            {selectedProvider && !isCustom && (
              <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Provider:</span>
                  <Badge variant="outline">{selectedProvider.provider}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Protocol:</span>
                  <Badge variant={selectedProvider.provider === 'anthropic' ? 'default' : 'secondary'}>
                    {selectedProvider.provider === 'anthropic' ? 'Anthropic' : 'OpenAI Compatible'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Default Model:</span>
                  <code className="text-xs bg-background px-2 py-1 rounded">
                    {selectedProvider.defaultModel}
                  </code>
                </div>
              </div>
            )}

            <Button onClick={handleSave} className="w-full" disabled={!apiKey.trim()}>
              <Save className="w-4 h-4 mr-2" />
              {saved ? 'Saved!' : 'Save Configuration'}
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
