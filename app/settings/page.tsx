'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
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
    <div className="min-h-screen bg-[#F8F9FB]">
      <Header />

      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="px-2 mb-6">
          <h1 className="text-[26px] font-black text-[#162361] tracking-tighter leading-none">
            Settings
          </h1>
          <p className="text-sm text-gray-400 font-bold mt-1">
            Configure your AI model and API settings
          </p>
        </div>

        {/* AI Configuration Section */}
        <SectionTitle title="AI Model Configuration" />
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden mb-8 p-6">
            
            {/* 1. Protocol Selection */}
            <div className="space-y-4 mb-8">
              <label className="text-[14px] font-black text-[#162361] flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <Settings2 className="w-3 h-3" />
                </div>
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
            <div className="space-y-4 mb-8">
              <label className="text-[14px] font-black text-[#162361] flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <Server className="w-3 h-3" />
                </div>
                Step 2: Select Provider
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableProviders.map((provider) => (
                  <ProviderButton
                    key={provider.id}
                    isActive={selectedProviderId === provider.id}
                    onClick={() => handleProviderSelect(provider.id)}
                    title={provider.name}
                    subtitle={`Default: ${provider.defaultModel}`}
                  />
                ))}
                
                {/* Custom Option */}
                <ProviderButton
                    isActive={selectedProviderId === 'custom'}
                    onClick={() => handleProviderSelect('custom')}
                    title="Custom Service"
                    subtitle="Self-hosted / Other"
                />
              </div>
            </div>

            {/* 3. Configuration Details */}
            <div className="space-y-6 pt-6 border-t border-dashed border-gray-100">
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

              {/* Model Name */}
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#162361]">Model Name</label>
                <Input
                  type="text"
                  placeholder="e.g., gpt-4, claude-3-5-sonnet"
                  value={customModel}
                  onChange={(e) => setCustomModels(prev => ({ ...prev, [protocol]: e.target.value }))}
                />
                <p className="text-[11px] font-bold text-gray-400">
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
              <div className="mt-6 p-4 bg-[#F8F9FB] rounded-xl border border-slate-100 flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">Selected Provider</span>
                  <span className="text-[12px] font-bold text-[#162361]">{selectedProvider.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Protocol:</span>
                  <Badge variant={protocol === 'anthropic' ? 'default' : protocol === '0g-compute' ? 'outline' : 'secondary'}>
                    {protocol === 'anthropic' ? 'Anthropic' : protocol === '0g-compute' ? '0G Compute' : 'OpenAI Compatible'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">Current Model</span>
                  <code className="text-[11px] font-bold text-[#007bf4] bg-blue-50 px-2 py-0.5 rounded">
                    {customModel || selectedProvider.defaultModel}
                  </code>
                </div>
              </div>
            )}

            <button 
                onClick={handleSave} 
                disabled={!apiKey.trim()}
                className={`w-full mt-6 py-4 rounded-2xl text-[13px] font-black transition-all transform active:scale-[0.98] flex items-center justify-center space-x-2
                    ${!apiKey.trim() 
                        ? 'bg-slate-100 text-gray-300 cursor-not-allowed' 
                        : saved 
                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                            : 'bg-[#162361] hover:bg-[#2a3b8f] text-white shadow-lg shadow-blue-900/20'
                    }`}
            >
                {saved ? <Check className="w-4 h-4 mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                {saved ? 'Saved Successfully!' : 'Save Configuration'}
            </button>
        </div>

        {/* Chain Preferences Section */}
        <SectionTitle title="Chain Preferences" />
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden mb-6 p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#162361]">Solana RPC URL</label>
                <Input
                  type="text"
                  defaultValue="https://api.mainnet-beta.solana.com"
                  disabled
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#162361]">BNB Chain RPC URL</label>
                <Input
                  type="text"
                  defaultValue="https://bsc-dataseed.binance.org"
                  disabled
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 text-gray-500 cursor-not-allowed"
                />
              </div>

              <p className="text-[11px] font-bold text-gray-400 italic">
                RPC endpoints are currently read-only. Custom RPCs coming soon.
              </p>
            </div>
        </div>

        <div className="px-4 py-2 mb-10">
            <p className="text-center text-[9px] font-bold text-gray-300 uppercase tracking-widest">Version 2.4.0</p>
        </div>

      </main>
    </div>
  );
}

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-4">{title}</h3>
);

const ProtocolButton: React.FC<{ isActive: boolean; onClick: () => void; title: string; subtitle: string; colorClass: string }> = ({ isActive, onClick, title, subtitle, colorClass }) => (
    <button
        onClick={onClick}
        className={`
        relative p-4 text-left rounded-2xl border-2 transition-all duration-200 group
        ${isActive
            ? 'border-[#162361] bg-[#162361]/5'
            : 'border-slate-100 hover:border-slate-200 bg-white'
        }
        `}
    >
        <div className="flex items-center gap-3 mb-1">
            <div className={`w-3 h-3 rounded-full ${isActive ? colorClass : 'bg-slate-200'}`}></div>
            <span className={`text-[13px] font-black ${isActive ? 'text-[#162361]' : 'text-gray-500'}`}>{title}</span>
        </div>
        <div className="text-[11px] font-bold text-gray-400 pl-6">{subtitle}</div>
        {isActive && (
            <div className="absolute top-4 right-4">
                <div className="w-5 h-5 rounded-full bg-[#162361] flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                </div>
            </div>
        )}
    </button>
);

const ProviderButton: React.FC<{ isActive: boolean; onClick: () => void; title: string; subtitle: string }> = ({ isActive, onClick, title, subtitle }) => (
    <button
        onClick={onClick}
        className={`
        relative p-4 text-left rounded-2xl border-2 transition-all duration-200
        ${isActive
            ? 'border-[#007bf4] bg-blue-50'
            : 'border-slate-100 hover:border-slate-200 bg-white'
        }
        `}
    >
        <div className={`text-[13px] font-black mb-1 ${isActive ? 'text-[#007bf4]' : 'text-[#162361]'}`}>{title}</div>
        <div className="text-[10px] font-bold text-gray-400">{subtitle}</div>
        {isActive && (
            <div className="absolute top-4 right-4">
                 <div className="w-5 h-5 rounded-full bg-[#007bf4] flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                </div>
            </div>
        )}
    </button>
);

