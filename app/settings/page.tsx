'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
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
                <ProtocolButton 
                    isActive={protocol === 'anthropic'}
                    onClick={() => handleProtocolChange('anthropic')}
                    title="Anthropic"
                    subtitle="Claude Series"
                    colorClass="bg-orange-500"
                />
                <ProtocolButton 
                    isActive={protocol === 'openai'}
                    onClick={() => handleProtocolChange('openai')}
                    title="OpenAI Compatible"
                    subtitle="GPT, DeepSeek, etc."
                    colorClass="bg-green-500"
                />
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
                  <label className="text-[13px] font-bold text-[#162361]">Base URL</label>
                  <Input
                    type="text"
                    placeholder={protocol === 'anthropic' ? 'https://api.anthropic.com' : 'https://api.example.com/v1'}
                    value={customBaseURL}
                    onChange={(e) => setCustomBaseURL(e.target.value)}
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-[#162361] focus:border-[#162361]"
                  />
                  <p className="text-[11px] font-bold text-gray-400">
                    Enter the API Base URL for your {protocol === 'anthropic' ? 'Anthropic' : 'OpenAI'} compatible provider
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
                  onChange={(e) => setCustomModel(e.target.value)}
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-[#162361] focus:border-[#162361]"
                />
                <p className="text-[11px] font-bold text-gray-400">
                    {isCustom 
                        ? 'Enter the model name to use' 
                        : 'Default model is pre-filled. You can override it if needed.'}
                </p>
              </div>

              {/* API Key */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-[13px] font-bold text-[#162361]">API Key</label>
                    <button 
                        onClick={() => setShowKey(!showKey)}
                        className="text-[11px] font-bold text-[#007bf4] hover:underline"
                    >
                        {showKey ? 'Hide' : 'Show'}
                    </button>
                </div>
                <div className="relative">
                    <Input
                        type={showKey ? 'text' : 'password'}
                        placeholder={protocol === 'anthropic' ? 'sk-ant-...' : 'sk-...'}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-[#162361] focus:border-[#162361] pr-10"
                    />
                    <div className="absolute right-3 top-3.5 text-gray-400">
                        <Key className="w-5 h-5" />
                    </div>
                </div>
                
                {/* Key Help Text */}
                <div className="text-[11px] font-bold text-gray-400">
                    {selectedProviderId === 'anthropic-official' && (
                        <span>Get your API key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-[#007bf4] hover:underline">console.anthropic.com</a></span>
                    )}
                    {selectedProviderId === 'openai-official' && (
                        <span>Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-[#007bf4] hover:underline">platform.openai.com/api-keys</a></span>
                    )}
                    {/* Add other providers as needed, keeping it concise */}
                    {!['anthropic-official', 'openai-official'].includes(selectedProviderId) && (
                        <span>Please refer to your provider's documentation for API keys.</span>
                    )}
                </div>
              </div>
            </div>

            {/* Provider Info Summary */}
            {!isCustom && selectedProvider && (
              <div className="mt-6 p-4 bg-[#F8F9FB] rounded-xl border border-slate-100 flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">Selected Provider</span>
                  <span className="text-[12px] font-bold text-[#162361]">{selectedProvider.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">Protocol</span>
                  <span className="text-[12px] font-bold text-[#162361]">
                    {protocol === 'anthropic' ? 'Anthropic' : 'OpenAI Compatible'}
                  </span>
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

