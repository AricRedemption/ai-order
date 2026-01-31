'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Settings, ListOrdered, Bot, TrendingUp } from 'lucide-react';
import { WalletConnection } from '@/components/wallet/WalletConnection';
import { SideMenu } from './SideMenu';

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/dashboard/assistant', label: 'AI Assistant', icon: Bot },
    { href: '/dashboard/memes', label: 'Hot Memes', icon: TrendingUp },
    { href: '/dashboard/orders', label: 'Orders', icon: ListOrdered },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="bg-slate-50 border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3 md:h-16 relative">
          {/* Logo Section */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center space-x-3 group">
               <div className="flex items-center justify-center w-10 h-10">
                  <svg
                    width="38"
                    height="38"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect x="4" y="15" width="4" height="4" rx="1.5" fill="#162361" />
                    <rect className="animate-logo-pulse-slow" x="4" y="10" width="4" height="4" rx="1.5" fill="#007bf4" />
                    <rect x="10" y="15" width="4" height="4" rx="1.5" fill="#162361" />
                    <rect x="10" y="10" width="4" height="4" rx="1.5" fill="#007bf4" />
                    <rect className="animate-logo-pulse-medium" x="10" y="5" width="4" height="4" rx="1.5" fill="#19e7eb" />
                    <rect x="16" y="15" width="4" height="4" rx="1.5" fill="#162361" />
                    <rect x="16" y="10" width="4" height="4" rx="1.5" fill="#162361" />
                    <rect className="animate-logo-pulse-medium" x="16" y="5" width="4" height="4" rx="1.5" fill="#007bf4" />
                    <rect className="animate-logo-pulse-fast" x="16" y="0" width="4" height="4" rx="1.5" fill="#19e7eb" />
                  </svg>
               </div>
               <span className="text-[20px] font-black tracking-tighter text-[#162361]">AI Meme Trader</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 text-sm font-bold transition-colors hover:text-[#007bf4] ${
                      isActive ? 'text-[#007bf4]' : 'text-[#162361]/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <WalletConnection />
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-11 h-11 flex flex-col justify-center items-center space-y-[4.5px] active:scale-90 transition-all active:opacity-60"
              aria-label="Toggle menu"
            >
              <div className="w-5 h-[2px] bg-[#162361] rounded-full"></div>
              <div className="w-5 h-[2px] bg-[#162361] rounded-full"></div>
              <div className="w-5 h-[2px] bg-[#162361] rounded-full"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Side Menu Implementation */}
      <SideMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
}
