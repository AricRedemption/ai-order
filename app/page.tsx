import Link from 'next/link';
import { ArrowRight, Mic, Zap, TrendingUp, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            AI Meme Trader
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Trade meme coins with AI-powered voice commands and smart conditional orders
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              Launch App <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/settings"
              className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors flex items-center justify-center"
            >
              Configure API Keys
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 md:mt-20">
          <FeatureCard
            icon={<Mic className="w-8 h-8" />}
            title="Voice Commands"
            description="Use voice to create orders and analyze tokens with AI"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Conditional Orders"
            description="Set price, market cap, volume, and time-based conditions"
          />
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="AI Analysis"
            description="AI-powered meme coin screening and recommendations"
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="Multi-Chain"
            description="Trade on Solana and BNB Chain with unified interface"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12 md:mt-20 text-center">
          <StatCard value="60+" label="Meme Coins Tracked" />
          <StatCard value="2" label="Chains Supported" />
          <StatCard value="4" label="Condition Types" />
        </div>

        {/* How It Works */}
        <div className="mt-12 md:mt-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Configure APIs"
              description="Add your Anthropic/OpenAI API keys in settings"
            />
            <StepCard
              number="2"
              title="Browse & Analyze"
              description="View trending meme coins or use AI to analyze tokens"
            />
            <StepCard
              number="3"
              title="Create Orders"
              description="Set conditional orders via voice or text commands"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12 md:mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>AI Meme Trader - Educational purposes only. Trade at your own risk.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors">
      <div className="text-blue-400 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-5xl font-bold text-blue-400 mb-2">{value}</div>
      <div className="text-gray-400">{label}</div>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
