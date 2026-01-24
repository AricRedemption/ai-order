'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, Settings, ListOrdered } from 'lucide-react';
import { WalletConnection } from '@/components/wallet/WalletConnection';

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/dashboard/orders', label: 'Orders', icon: ListOrdered },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between md:h-16">
          <div className="flex items-center gap-4 md:gap-8 flex-wrap">
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

          <div className="flex items-center gap-2 w-full md:w-auto md:justify-end">
            <WalletConnection />
          </div>
        </div>
      </div>
    </header>
  );
}
