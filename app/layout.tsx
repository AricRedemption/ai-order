import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TradingProvider } from '@/lib/trading/TradingContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Meme Trader - Smart Crypto Trading Platform',
  description: 'AI-powered meme coin trading with voice commands and conditional orders',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TradingProvider>
          {children}
        </TradingProvider>
      </body>
    </html>
  );
}
