'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, Save, Eye, EyeOff, Check, Settings2, Server } from 'lucide-react';
import { PRESET_PROVIDERS } from '@/lib/ai/constants';
import type { AIConfig, AIProvider } from '@/types/ai';

const STORAGE_KEY = 'ai-meme-trader-config';

export default function SettingsPage() {
  const [showKey, setShowKey] = useState(false);
  const [protocol, setProtocol] = useState<AIProvider>('anthropic');
  const [selectedProviderIds, setSelectedProviderIds] = useState<Record<AIProvider, string>>({
    anthropic: 'anthropic-official',
    openai: 'openai-official',
    '0g-compute': '0g-compute-official',
  });
  const [apiKey, setApiKey] = useState(''); // Shared key for simplicity, or could be per-provider
  const [customBaseURLs, setCustomBaseURLs] = useState<Record<AIProvider, string>>({
    anthropic: '',
    openai: '',
    '0g-compute': '',
  });
  const [customModels, setCustomModels] = useState<Record<AIProvider, string>>({
    anthropic: 'claude-3-5-sonnet-20241022',
    openai: 'gpt-4-turbo-preview',
    '0g-compute': 'qwen/qwen-2.5-7b-instruct',
  });
  const [saved, setSaved] = useState(false);
  const [zgBalance, setZgBalance] = useState<{ total: string; available: string; subAccount: string } | null>(null);
  const [checkingBalance, setCheckingBalance] = useState(false);

  // Filter providers based on protocol, excluding the default 'custom' from presets
  // because we'll add a context-aware custom option
  const availableProviders = useMemo(() => {
    return PRESET_PROVIDERS.filter(
      p => p.provider === protocol && p.id !== 'custom'
    );
  }, [protocol]);

  const selectedProviderId = selectedProviderIds[protocol];
  const customBaseURL = customBaseURLs[protocol];
  const customModel = customModels[protocol];
  const isCustom = selectedProviderId === 'custom';
  
  // Find selected provider details (from presets)
  const selectedProvider = PRESET_PROVIDERS.find(p => p.id === selectedProviderId);

  const handleProtocolChange = (newProtocol: AIProvider) => {
    setProtocol(newProtocol);
  };

  const handleProviderSelect = (providerId: string) => {
    setSelectedProviderIds(prev => ({ ...prev, [protocol]: providerId }));
    if (providerId !== 'custom') {
      const provider = PRESET_PROVIDERS.find(p => p.id === providerId);
      if (provider) {
        setCustomModels(prev => ({ ...prev, [protocol]: provider.defaultModel }));
      }
    }
  };

  const handleSave = () => {
    const config: AIConfig = {
      provider: protocol,
      apiKey,
      baseURL: isCustom ? customBaseURL : selectedProvider?.baseURL || undefined,
      model: customModel || selectedProvider?.defaultModel, 
    };

    // Save full maps to ensure persistence across sessions
    const fullConfig = {
      apiKey,
      lastProtocol: protocol,
      providerIds: selectedProviderIds,
      baseURLs: customBaseURLs,
      models: customModels,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); // Keep 0.6.x compatibility for the backend
    localStorage.setItem(STORAGE_KEY + '-v2', JSON.stringify(fullConfig)); // New format for UI state
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const check0GBalance = async () => {
    if (!apiKey) return;
    setCheckingBalance(true);
    try {
      const response = await fetch('/api/ai/0g/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          privateKey: apiKey, 
          modelName: customModel,
          providerAddress: customBaseURL
        }),
      });
      const data = await response.json();
      if (data.success) {
        setZgBalance(data.balance);
      } else {
        alert('Check 0G balance failed: ' + data.error);
      }
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setCheckingBalance(false);
    }
  };

  useEffect(() => {
    const v2Stored = localStorage.getItem(STORAGE_KEY + '-v2');
    if (v2Stored) {
      const config = JSON.parse(v2Stored);
      if (config.apiKey) setApiKey(config.apiKey);
      if (config.lastProtocol) setProtocol(config.lastProtocol);
      if (config.providerIds) setSelectedProviderIds(config.providerIds);
      if (config.baseURLs) setCustomBaseURLs(config.baseURLs);
      if (config.models) setCustomModels(config.models);
    } else {
      // Migration from old config
      const oldStored = localStorage.getItem(STORAGE_KEY);
      if (oldStored) {
        const config: AIConfig = JSON.parse(oldStored);
        setApiKey(config.apiKey || '');
        if (config.provider) {
          setProtocol(config.provider);
          // Try to migrate this specific provider's data
          if (config.model) setCustomModels(prev => ({ ...prev, [config.provider]: config.model }));
          if (config.baseURL) {
            setCustomBaseURLs(prev => ({ ...prev, [config.provider]: config.baseURL }));
            const matchingProvider = PRESET_PROVIDERS.find(p => p.baseURL === config.baseURL && p.provider === config.provider);
            if (matchingProvider) {
              setSelectedProviderIds(prev => ({ ...prev, [config.provider]: matchingProvider.id }));
            } else {
              setSelectedProviderIds(prev => ({ ...prev, [config.provider]: 'custom' }));
            }
          }
        }
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

                <button
                  onClick={() => handleProtocolChange('0g-compute')}
                  className={`
                    relative p-4 text-left rounded-lg border-2 transition-all flex items-center gap-3
                    ${protocol === '0g-compute'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${protocol === '0g-compute' ? 'border-primary' : 'border-muted-foreground'}`}>
                    {protocol === '0g-compute' && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <div className="font-medium">0G Compute</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Decentralized AI</div>
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
                  <label className="text-sm font-medium">
                    {protocol === '0g-compute' ? 'Provider Address (Optional)' : 'Base URL'}
                  </label>
                  <Input
                    type="text"
                    placeholder={
                      protocol === '0g-compute' ? '0x...' : 
                      protocol === 'anthropic' ? 'https://api.anthropic.com' : 
                      'https://api.example.com/v1'
                    }
                    value={customBaseURL}
                    onChange={(e) => setCustomBaseURLs(prev => ({ ...prev, [protocol]: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    {protocol === '0g-compute' 
                      ? 'Override the provider address if automatic discovery fails.' 
                      : `Enter the API Base URL for your ${protocol === 'anthropic' ? 'Anthropic' : 'OpenAI'} compatible provider`}
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
                  onChange={(e) => setCustomModels(prev => ({ ...prev, [protocol]: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                    {isCustom 
                        ? 'Enter the model name to use' 
                        : 'Default model is pre-filled. You can override it if needed.'}
                </p>
              </div>

              {/* API Key */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {protocol === '0g-compute' ? 'Private Key' : 'API Key'}
                </label>
                <Input
                  type={showKey ? 'text' : 'password'}
                  placeholder={
                    protocol === 'anthropic' ? 'sk-ant-...' : 
                    protocol === '0g-compute' ? 'Your EVM Private Key (0x...)' :
                    'sk-...'
                  }
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
                {selectedProviderId === '0g-compute' && (
                  <div className="space-y-4">
                    <p className="text-xs text-muted-foreground">
                      Learn more about 0G Compute from{' '}
                      <a
                        href="https://docs.0g.ai/developer-hub/building-on-0g/compute-network/inference"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        docs.0g.ai
                      </a>
                    </p>
                    <div className="flex flex-col gap-2">
                       <Button 
                         variant="outline" 
                         size="sm" 
                         onClick={check0GBalance}
                         disabled={checkingBalance || !apiKey}
                       >
                         {checkingBalance ? 'Checking...' : 'Check 0G Balance'}
                       </Button>
                       {zgBalance && (
                         <div className="p-3 bg-primary/5 rounded border border-primary/20 text-xs space-y-1">
                           <div className="flex justify-between">
                             <span>Total Ledger:</span>
                             <span className="font-mono">{zgBalance.total} OG</span>
                           </div>
                           <div className="flex justify-between">
                             <span>Available:</span>
                             <span className="font-mono">{zgBalance.available} OG</span>
                           </div>
                           <div className="flex justify-between font-bold">
                             <span>Sub-Account ({customModel}):</span>
                             <span className="font-mono">{zgBalance.subAccount} OG</span>
                           </div>
                         </div>
                       )}
                    </div>
                  </div>
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
                  <Badge variant={protocol === 'anthropic' ? 'default' : protocol === '0g-compute' ? 'outline' : 'secondary'}>
                    {protocol === 'anthropic' ? 'Anthropic' : protocol === '0g-compute' ? '0G Compute' : 'OpenAI Compatible'}
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
