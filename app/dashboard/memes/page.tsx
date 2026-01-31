'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { AssetRow } from '@/components/ai-trade/AssetRow';
import { SubscriptionModal } from '@/components/ai-trade/SubscriptionModal';
import { FloatingAssistant } from '@/components/ai-trade/FloatingAssistant';
import { ASSETS, SIGNAL_ASSETS } from '@/components/ai-trade/constants';
import { Asset } from '@/components/ai-trade/types';

export default function MemesPage() {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  // Store assets in state to allow updates
  const [assets, setAssets] = useState<Asset[]>(ASSETS);

  // Simulate Data Update - RUNS ONLY ONCE
  useEffect(() => {
    const timer = setTimeout(() => {
      setAssets(prevAssets => {
        return prevAssets.map(asset => {
          if (Math.random() > 0.5) {
            const newChangeRaw = (Math.random() * 15) + 0.1;
            const newChange = `${newChangeRaw.toFixed(2)}%`;
            const newIsPositive = Math.random() > 0.5;

            return {
              ...asset,
              change: newChange,
              isPositive: newIsPositive
            };
          }
          return asset;
        });
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Updated logic: Show 15 by default, expand to all 20
  const visibleCount = isExpanded ? 20 : 15;
  const visibleAssets = assets.slice(0, visibleCount);

  const handleSubscribeClick = () => {
    if (!isSubscribed) {
      setShowModal(true);
    }
  };

  const handleConfirmSubscription = () => {
    setIsSubscribed(true);
    setShowModal(false);
  };

  return (
    <div className="h-[100dvh] bg-slate-50 font-sans antialiased relative overflow-hidden flex flex-col">
      <Header />
      
      <main className="flex-1 w-full max-w-md mx-auto bg-slate-50 flex flex-col relative shadow-2xl overflow-hidden pb-10">
        <div className="flex flex-col flex-1 animate-fade-in overflow-y-auto no-scrollbar pt-6">
             {!isSubscribed && (
              <div className="px-6 mt-3 mb-8 shrink-0">
                <button 
                  onClick={handleSubscribeClick}
                  className="w-full flex flex-row items-center justify-between p-6 rounded-[28px] border border-slate-200 bg-white shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:border-slate-300 active:scale-[0.99] transition-all group overflow-hidden relative"
                >
                   {/* Left Text Content - Structured for Left/Right Alignment */}
                   <div className="flex flex-col items-start z-10 flex-1 mr-4">
                      {/* Title Row */}
                      <div className="flex items-center space-x-2 mb-1.5 w-full">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] shrink-0"></div>
                        <span className="text-[17px] font-black tracking-tight text-[#162361] uppercase group-hover:text-[#007bf4] transition-colors leading-none whitespace-nowrap">
                          Subscribe To Live Data
                        </span>
                      </div>
                      {/* Justified Subtitle - Forced alignment on both ends using justify-between */}
                      <div className="w-full flex justify-between items-center text-[9px] font-black text-slate-400 uppercase opacity-80 leading-none tracking-normal">
                        <span>Subscribe</span>
                        <span>To</span>
                        <span>Get</span>
                        <span>More</span>
                        <span>Featured</span>
                        <span>Content</span>
                      </div>
                   </div>

                   {/* Right Side Silver Meme Coin Icon */}
                   <div className="relative flex items-center justify-center w-12 h-12 z-10 shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-300 to-slate-400 rounded-full border border-slate-200 shadow-inner flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center bg-gradient-to-tl from-slate-200 to-transparent">
                          <span className="text-[18px] font-black text-white/90 drop-shadow-md select-none">M</span>
                        </div>
                      </div>
                      {/* Soft Glow */}
                      <div className="absolute inset-0 bg-slate-400/20 blur-xl rounded-full scale-150 -z-10 group-hover:bg-blue-400/10 transition-colors"></div>
                   </div>
                </button>
              </div>
            )}

            {/* Title Section: Hot Coins */}
            <div className="px-6 pt-2 pb-6 flex justify-between items-center shrink-0">
              <h1 className="text-[26px] font-black text-[#162361] tracking-tighter leading-none">
                Hot Coins
              </h1>
              <div className="flex items-center">
                <span className="text-[10px] font-bold text-[#007bf4] tracking-widest bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 uppercase">
                  15 SELECTED
                </span>
              </div>
            </div>

            {/* Hot Coins Container */}
            <div className="bg-white rounded-[36px] mx-2 px-6 pt-4 pb-6 shadow-sm flex flex-col z-0 mb-8">
              <div className="flex flex-col space-y-1">
                {visibleAssets.map((asset, index) => (
                  <AssetRow 
                    key={asset.rank} 
                    asset={asset} 
                    isLast={index === visibleAssets.length - 1} 
                  />
                ))}
              </div>

              {/* See More Toggle */}
              <div className="mt-8 flex justify-center">
                 <button 
                   onClick={() => setIsExpanded(!isExpanded)}
                   className="flex flex-col items-center space-y-2 group outline-none active:opacity-70 transition-opacity"
                 >
                    <span className="text-[9px] font-extrabold text-gray-300 group-hover:text-[#162361] transition-colors uppercase tracking-[0.15em]">
                      {isExpanded ? 'See Less' : 'See Full List'}
                    </span>
                    <div className={`w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center transition-all duration-300 group-hover:bg-gray-100 shadow-sm border border-transparent group-hover:border-gray-200 ${isExpanded ? 'rotate-180' : ''}`}>
                       <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                         <path d="M1 1L5 5L9 1" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-[#162361] transition-colors"/>
                       </svg>
                    </div>
                 </button>
              </div>
            </div>

            {/* Title Section: Second-Stage Signal (二段信号) */}
            <div className="px-6 pt-2 pb-6 flex justify-between items-center shrink-0">
              <h1 className="text-[26px] font-black text-[#162361] tracking-tighter leading-none">
                Stage 2 Signals
              </h1>
              <div className="flex items-center">
                <span className="text-[10px] font-bold text-[#007bf4] tracking-widest bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 uppercase">
                  15 SELECTED
                </span>
              </div>
            </div>

            {/* Signal Panel Container - Mirroring layout of Hot Coins */}
            <div className="bg-white rounded-[36px] mx-2 px-6 pt-4 pb-10 shadow-sm flex flex-col z-0">
              <div className="flex flex-col space-y-1">
                {SIGNAL_ASSETS.map((asset, index) => (
                  <AssetRow 
                    key={`signal-${asset.rank}`} 
                    asset={asset} 
                    isLast={index === SIGNAL_ASSETS.length - 1} 
                  />
                ))}
              </div>
            </div>
        </div>

        <FloatingAssistant onClick={() => router.push('/dashboard/assistant')} />

        <SubscriptionModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          onContinue={handleConfirmSubscription}
        />
      </main>
    </div>
  );
}
