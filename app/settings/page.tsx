'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, Save, Eye, EyeOff, Check, Settings2, Server } from 'lucide-react';
import { PRESET_PROVIDERS } from '@/lib/ai/client';
import type { AIConfig, AIProvider } from '@/types/ai';

const STORAGE_KEY = 'ai-meme-trader-config';

export default function SettingsPage() {
  const [showKey, setShowKey] = useState(false);
  const [protocol, setProtocol] = useState<AIProvider>('anthropic');
  const [selectedProviderId, setSelectedProviderId] = useState('anthropic-official');
  const [apiKey, setApiKey] = useState('');
  const [customBaseURL, setCustomBaseURL] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [saved, setSaved] = useState(false);

  // Filter providers based on protocol, excluding the default 'custom' from presets
  // because we'll add a context-aware custom option
  const availableProviders = useMemo(() => {
    return PRESET_PROVIDERS.filter(
      p => p.provider === protocol && p.id !== 'custom'
    );
  }, [protocol]);

  const isCustom = selectedProviderId === 'custom';
  
  // Find selected provider details (from presets)
  const selectedProvider = PRESET_PROVIDERS.find(p => p.id === selectedProviderId);

  const handleProtocolChange = (newProtocol: AIProvider) => {
    setProtocol(newProtocol);
    // Reset selection when protocol changes
    if (newProtocol === 'anthropic') {
      setSelectedProviderId('anthropic-official');
      // Set default model for the new protocol's default provider
      const defaultProvider = PRESET_PROVIDERS.find(p => p.id === 'anthropic-official');
      if (defaultProvider) setCustomModel(defaultProvider.defaultModel);
    } else {
      setSelectedProviderId('openai-official');
      const defaultProvider = PRESET_PROVIDERS.find(p => p.id === 'openai-official');
      if (defaultProvider) setCustomModel(defaultProvider.defaultModel);
    }
  };

  const handleProviderSelect = (providerId: string) => {
    setSelectedProviderId(providerId);
    if (providerId !== 'custom') {
      const provider = PRESET_PROVIDERS.find(p => p.id === providerId);
      if (provider) {
        setCustomModel(provider.defaultModel);
      }
    }
  };

  const handleSave = () => {
    const config: AIConfig = {
      provider: protocol,
      apiKey,
      baseURL: isCustom ? customBaseURL : selectedProvider?.baseURL || undefined,
      // Always use the customModel state, which allows overriding defaults
      model: customModel || selectedProvider?.defaultModel, 
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const config: AIConfig = JSON.parse(stored);
      setApiKey(config.apiKey || '');
      
      // Restore protocol
      if (config.provider) {
        setProtocol(config.provider);
      }

      // Restore provider selection
      if (config.baseURL) {
        const matchingProvider = PRESET_PROVIDERS.find(
          p => p.baseURL === config.baseURL && p.provider === config.provider
        );
        if (matchingProvider) {
          setSelectedProviderId(matchingProvider.id);
        } else {
          setSelectedProviderId('custom');
          setCustomBaseURL(config.baseURL);
        }
      } else {
        // No base URL usually means official provider
        // Try to find matching official provider for the protocol
        const defaultOfficial = PRESET_PROVIDERS.find(
            p => p.provider === config.provider && !p.baseURL
        );
        if (defaultOfficial) {
            setSelectedProviderId(defaultOfficial.id);
        } else {
            // Fallback
            setSelectedProviderId('custom');
        }
      }
      
      // Always restore the model if present
      if (config.model) {
        setCustomModel(config.model);
      }
    } else {
        // Initialize default model if no config
        setCustomModel('claude-3-5-sonnet-20241022');
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
          <CardContent className="space-y-8">
            
            {/* 1. Protocol Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                Step 1: Select Protocol
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleProtocolChange('anthropic')}
                  className={`
                    relative p-4 text-left rounded-lg border-2 transition-all flex items-center gap-3
                    ${protocol === 'anthropic'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${protocol === 'anthropic' ? 'border-primary' : 'border-muted-foreground'}`}>
                    {protocol === 'anthropic' && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <div className="font-medium">Anthropic</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Claude Series</div>
                  </div>
                </button>

                <button
                  onClick={() => handleProtocolChange('openai')}
                  className={`
                    relative p-4 text-left rounded-lg border-2 transition-all flex items-center gap-3
                    ${protocol === 'openai'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${protocol === 'openai' ? 'border-primary' : 'border-muted-foreground'}`}>
                    {protocol === 'openai' && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <div className="font-medium">OpenAI Compatible</div>
                    <div className="text-xs text-muted-foreground mt-0.5">GPT, DeepSeek, etc.</div>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Provider Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Server className="w-4 h-4" />
                Step 2: Select Provider
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableProviders.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => handleProviderSelect(provider.id)}
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
                    <div className="text-xs text-muted-foreground mt-1">
                      Default: {provider.defaultModel}
                    </div>
                  </button>
                ))}
                
                {/* Custom Option */}
                <button
                  onClick={() => handleProviderSelect('custom')}
                  className={`
                    relative p-4 text-left rounded-lg border-2 transition-all
                    ${selectedProviderId === 'custom'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  {selectedProviderId === 'custom' && (
                    <Check className="absolute top-3 right-3 w-5 h-5 text-primary" />
                  )}
                  <div className="font-medium text-sm">Custom Service</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Self-hosted / Other
                  </div>
                </button>
              </div>
            </div>

            {/* 3. Configuration Details */}
            <div className="space-y-6 pt-4 border-t">
              {/* Custom Base URL */}
              {isCustom && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Base URL</label>
                  <Input
                    type="text"
                    placeholder={protocol === 'anthropic' ? 'https://api.anthropic.com' : 'https://api.example.com/v1'}
                    value={customBaseURL}
                    onChange={(e) => setCustomBaseURL(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the API Base URL for your {protocol === 'anthropic' ? 'Anthropic' : 'OpenAI'} compatible provider
                  </p>
                </div>
              )}

              {/* Model Name - Now always visible */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Model Name</label>
                <Input
                  type="text"
                  placeholder="e.g., gpt-4, claude-3-5-sonnet"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                    {isCustom 
                        ? 'Enter the model name to use' 
                        : 'Default model is pre-filled. You can override it if needed.'}
                </p>
              </div>

              {/* API Key */}
              <div className="space-y-2">
                <label className="text-sm font-medium">API Key</label>
                <Input
                  type={showKey ? 'text' : 'password'}
                  placeholder={protocol === 'anthropic' ? 'sk-ant-...' : 'sk-...'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                
                {/* Key Help Text */}
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
                {selectedProviderId.includes('zhipu') && (
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
                {selectedProviderId.includes('minimax') && (
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
                 {selectedProviderId.includes('deepseek') && (
                  <p className="text-xs text-muted-foreground">
                    Get your API key from{' '}
                    <a
                      href="https://platform.deepseek.com/api_keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      platform.deepseek.com
                    </a>
                  </p>
                )}
                {selectedProviderId.includes('moonshot') && (
                  <p className="text-xs text-muted-foreground">
                    Get your API key from{' '}
                    <a
                      href="https://platform.moonshot.cn/console/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      platform.moonshot.cn
                    </a>
                  </p>
                )}
              </div>
            </div>

            {/* Provider Info Summary */}
            {!isCustom && selectedProvider && (
              <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Selected Provider:</span>
                  <Badge variant="outline">{selectedProvider.name}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Protocol:</span>
                  <Badge variant={protocol === 'anthropic' ? 'default' : 'secondary'}>
                    {protocol === 'anthropic' ? 'Anthropic' : 'OpenAI Compatible'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Current Model:</span>
                  <code className="text-xs bg-background px-2 py-1 rounded">
                    {customModel || selectedProvider.defaultModel}
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
