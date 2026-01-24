'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, Settings, ListOrdered, Menu, X, Bot, TrendingUp } from 'lucide-react';
import { WalletConnection } from '@/components/wallet/WalletConnection';

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/dashboard/assistant', label: 'AI Assistant', icon: Bot },
    { href: '/dashboard/memes', label: 'Hot Memes', icon: TrendingUp },
    { href: '/dashboard/orders', label: 'Orders', icon: ListOrdered },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3 md:h-16">
          <div className="flex items-center gap-4 md:gap-8">
            <Link href="/" className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              AI Meme Trader
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <WalletConnection />
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors hover:bg-accent ${
                      isActive ? 'bg-accent text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
              
              <div className="border-t my-2 pt-4 px-4">
                <p className="text-sm text-muted-foreground mb-3 font-medium">Connect Wallet</p>
                <WalletConnection />
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
