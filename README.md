# AI Meme Trader

A Next.js application that combines AI (Anthropic/OpenAI APIs + 0G Compute Network) with blockchain trading capabilities for meme coins on Solana and BNB chains.

## Features

✨ **AI-Powered Trading**
- Anthropic Claude & OpenAI GPT integration
- 0G Compute Network integration (decentralized inference)
- Voice commands via OpenAI Whisper & TTS
- Natural language order creation

🔗 **Multi-Chain Support**
- Solana trading via strategy pattern
- BNB Chain trading via viem
- Unified trading interface

📊 **Smart Conditional Orders**
- Price-based conditions
- Market cap triggers
- Volume thresholds
- Time-delayed execution

🎨 **Modern UI**
- Built with Next.js 14 App Router
- Tailwind CSS + shadcn/ui components
- Responsive design
- Real-time updates

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

```env
ANTHROPIC_API_KEY=your_anthropic_key_here
OPENAI_API_KEY=your_openai_key_here
```

Note: 0G Compute does not use an API key. It uses an EVM private key and is configured in the UI (stored locally in your browser).

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### 4. Configure API Keys in UI

1. Navigate to Settings page
2. Select the protocol you want to use (Anthropic / OpenAI Compatible / 0G Compute)
3. For Anthropic/OpenAI: enter your API key
4. For 0G Compute: enter your private key, optionally override provider address/model, then check your 0G balance
5. Keys are stored locally in your browser

## Project Structure

```
ai-meme-trader/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Main dashboard
│   └── settings/          # Settings page
├── components/            # React components
│   ├── ui/               # shadcn components
│   ├── trading/          # Trading components
│   └── layout/           # Layout components
├── lib/                   # Core logic
│   ├── trading/          # Trading strategies
│   ├── ai/               # AI integration
│   └── data/             # Mock data
├── types/                 # TypeScript types
└── config/               # Configuration files
```

## Architecture Highlights

### Strategy Pattern for Trading
```typescript
// Abstract interface
interface TradingStrategy {
  buyToken(params): Promise<TransactionResult>;
  getBalance(address): Promise<Balance>;
}

// Implementations
- SolanaStrategy
- BNBStrategy
```

### Mock Data Layer
- 60+ generated meme tokens
- Real-time price simulation
- Easy switch to production APIs

### Conditional Order Engine
- Monitors orders every 5 seconds
- Supports 4 condition types
- Automatic execution when triggered

### 0G Compute Network
- Adds a decentralized inference option alongside Anthropic/OpenAI-compatible providers
- Uses `@0glabs/0g-serving-broker` to discover services and request inference
- Exposes a balance-check endpoint for the 0G ledger

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Blockchain**: viem (BNB) + @solana/web3.js
- **AI**: Anthropic SDK + OpenAI SDK
- **UI**: Tailwind CSS + shadcn/ui
- **State**: React Context + Zustand

## Current Status

✅ **Completed**
- Project setup and configuration
- Trading strategy pattern implementation
- Mock meme data generation (60+ tokens)
- AI integration (Anthropic + OpenAI)
- Voice processing (Whisper + TTS)
- Conditional order system
- Basic UI components
- Dashboard and settings pages

🚧 **In Progress**
- Full UI component library
- AI chat interface
- Order management page

📋 **Planned**
- Wallet connection
- Real API integration (DexScreener, Jupiter)
- Production trading execution
- Advanced analytics

## Development Notes

### Mock vs Production Mode

Currently running in **Mock Mode**:
- All trades are simulated
- Token data is generated
- No real blockchain transactions

To switch to production:
1. Implement real API calls in `lib/data/`
2. Enable actual swap transactions in strategies
3. Connect wallet adapter
4. Update environment variables

### Adding New Chains

Thanks to the strategy pattern, adding new chains is easy:

1. Create new strategy: `lib/trading/strategies/NewChainStrategy.ts`
2. Implement `TradingStrategy` interface
3. Register in `TradingContext.tsx`
4. Update types in `types/trading.ts`

## License

MIT

## Disclaimer

This is an educational project. Trading cryptocurrencies involves significant risk. Always do your own research and never invest more than you can afford to lose.
