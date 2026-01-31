import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onContinue }) => {
  const [selectedPlan, setSelectedPlan] = useState<'week' | 'month' | 'months6'>('month');
  const [view, setView] = useState<'select' | 'success'>('select');

  // Reset view when modal opens
  useEffect(() => {
    if (isOpen) {
      setView('select');
    }
  }, [isOpen]);

  const handlePlanContinue = () => {
    // 1. Trigger Fireworks
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 60 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    // Initial burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      zIndex: 60,
      colors: ['#162361', '#007bf4', '#19e7eb'] // Using brand colors
    });

    // Continuous smaller bursts
    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ['#162361', '#007bf4', '#19e7eb'] }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#162361', '#007bf4', '#19e7eb'] }));
    }, 250);

    // 2. Switch to Success View
    setView('success');
  };

  const handleFinalClose = () => {
    // If we are in success state, we consider the subscription confirmed
    if (view === 'success') {
      onContinue(); // This updates App state to 'isSubscribed' and closes modal
    } else {
      onClose(); // Just close without subscribing
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
       {/* 
         Background Mask 
       */}
       <div 
         className="absolute inset-0 bg-[#162361]/60 animate-fade-in" 
         onClick={handleFinalClose}
       ></div>

       {/* 
         Floating Card Container 
       */}
       <div 
         className="relative w-[90%] max-w-[350px] bg-white/85 backdrop-blur-2xl border border-white/40 rounded-[40px] shadow-2xl overflow-visible flex flex-col animate-float-up transform transition-all z-10"
         style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}
       >
          
          {/* Close Button */}
          <button 
            onClick={handleFinalClose} 
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors z-20"
          >
             <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M1 1L11 11M1 11L11 1" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/>
             </svg>
          </button>

          {/* Content Area */}
          <div className="flex flex-col items-center pt-8 px-4 pb-6 min-h-[460px] justify-center">
             
             {view === 'select' ? (
               <div className="w-full flex flex-col items-center animate-content-fade">
                 {/* Header Text */}
                 <h2 className="text-xl font-black text-[#162361] mb-1 tracking-tight">AI Trade Pro</h2>
                 <p className="text-[11px] text-slate-500 font-medium mb-8 text-center px-4">
                   Unlock real-time data & priority execution
                 </p>

                 {/* Cards Carousel */}
                 <div className="w-full flex items-center justify-center space-x-3 mb-8 h-[200px]">
                    
                    {/* 1 Week */}
                    <div 
                       onClick={() => setSelectedPlan('week')}
                       className={`flex-1 h-[140px] rounded-2xl border transition-all duration-300 flex flex-col items-center justify-between py-4 cursor-pointer
                       ${selectedPlan === 'week' 
                         ? 'bg-[#162361] border-[#162361] shadow-xl scale-110 z-10' 
                         : 'bg-white/60 border-white/50 hover:bg-white/80 scale-95 opacity-80'}`}
                    >
                       <div className="flex flex-col items-center mt-1">
                          <span className={`text-2xl font-bold ${selectedPlan === 'week' ? 'text-white' : 'text-slate-800'}`}>1</span>
                          <span className={`text-[9px] font-bold uppercase tracking-widest ${selectedPlan === 'week' ? 'text-gray-400' : 'text-slate-400'}`}>Week</span>
                       </div>
                       <div className="flex flex-col items-center">
                         <span className={`text-[9px] font-medium mb-0.5 ${selectedPlan === 'week' ? 'text-gray-400' : 'text-slate-400'}`}>$4.99/wk</span>
                         <span className={`text-xs font-bold ${selectedPlan === 'week' ? 'text-white' : 'text-[#162361]'}`}>$4.99</span>
                       </div>
                    </div>

                    {/* 1 Month (Center) */}
                    <div 
                       onClick={() => setSelectedPlan('month')}
                       className={`relative flex-[1.2] h-[180px] rounded-2xl border transition-all duration-300 flex flex-col items-center justify-between py-4 cursor-pointer
                       ${selectedPlan === 'month' 
                         ? 'bg-[#162361] border-[#162361] shadow-2xl scale-110 z-20' 
                         : 'bg-white/60 border-white/50 hover:bg-white/80 scale-95 opacity-80'}`}
                    >
                       {/* BEST Tag */}
                       {selectedPlan === 'month' && (
                         <div className="absolute -top-3 bg-slate-200 text-slate-800 text-[9px] font-extrabold px-3 py-1 rounded-full shadow-sm tracking-wide border border-white">
                           BEST
                         </div>
                       )}

                       <div className="flex flex-col items-center mt-2">
                          <span className={`text-4xl font-bold ${selectedPlan === 'month' ? 'text-white' : 'text-slate-800'}`}>1</span>
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedPlan === 'month' ? 'text-gray-400' : 'text-slate-400'}`}>Month</span>
                          
                          {/* Discount Pill */}
                          <div className={`mt-3 text-[10px] font-bold px-2.5 py-1 rounded-lg ${selectedPlan === 'month' ? 'bg-[#1A1A2E] text-[#9D8CFF]' : 'bg-slate-200 text-slate-500'}`}>
                            -54%
                          </div>
                       </div>

                       <div className="flex flex-col items-center mb-1">
                         <span className={`text-[10px] font-medium mb-0.5 ${selectedPlan === 'month' ? 'text-gray-400' : 'text-slate-400'}`}>$2.31/wk</span>
                         <span className={`text-base font-bold ${selectedPlan === 'month' ? 'text-white' : 'text-[#162361]'}`}>$9.99</span>
                       </div>
                    </div>

                    {/* 6 Months */}
                    <div 
                       onClick={() => setSelectedPlan('months6')}
                       className={`flex-1 h-[140px] rounded-2xl border transition-all duration-300 flex flex-col items-center justify-between py-4 cursor-pointer
                       ${selectedPlan === 'months6' 
                         ? 'bg-[#162361] border-[#162361] shadow-xl scale-110 z-10' 
                         : 'bg-white/60 border-white/50 hover:bg-white/80 scale-95 opacity-80'}`}
                    >
                       <div className="flex flex-col items-center mt-1">
                          <span className={`text-2xl font-bold ${selectedPlan === 'months6' ? 'text-white' : 'text-slate-800'}`}>6</span>
                          <span className={`text-[9px] font-bold uppercase tracking-widest ${selectedPlan === 'months6' ? 'text-gray-400' : 'text-slate-400'}`}>Months</span>
                       </div>
                       <div className="flex flex-col items-center">
                          <span className={`text-[9px] font-medium mb-0.5 ${selectedPlan === 'months6' ? 'text-gray-400' : 'text-slate-400'}`}>$1.35/wk</span>
                          <span className={`text-xs font-bold ${selectedPlan === 'months6' ? 'text-white' : 'text-[#162361]'}`}>$34.99</span>
                       </div>
                    </div>
                 </div>

                 {/* Category Selector (Dots) */}
                 <div className="flex space-x-2 mb-8">
                   <button onClick={() => setSelectedPlan('week')} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${selectedPlan === 'week' ? 'bg-[#162361] scale-125' : 'bg-gray-300 hover:bg-gray-400'}`}></button>
                   <button onClick={() => setSelectedPlan('month')} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${selectedPlan === 'month' ? 'bg-[#162361] scale-125' : 'bg-gray-300 hover:bg-gray-400'}`}></button>
                   <button onClick={() => setSelectedPlan('months6')} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${selectedPlan === 'months6' ? 'bg-[#162361] scale-125' : 'bg-gray-300 hover:bg-gray-400'}`}></button>
                 </div>

                 {/* Action Button */}
                 <button 
                   onClick={handlePlanContinue}
                   className="w-full bg-[#007bf4] text-white font-bold text-[17px] py-4 rounded-[24px] shadow-lg active:scale-95 transition-transform hover:bg-blue-500"
                 >
                   Continue
                 </button>
               </div>
             ) : (
               /* Success View */
               <div className="w-full flex flex-col items-center justify-center animate-content-fade py-6">
                 <div className="w-20 h-20 bg-[#007bf4] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                   <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                   </svg>
                 </div>
                 
                 <h2 className="text-2xl font-black text-[#162361] mb-2 tracking-tight text-center">Congratulations!</h2>
                 <p className="text-sm text-slate-500 font-medium mb-10 text-center leading-relaxed max-w-[240px]">
                   You are now a subscribed member of <br/><span className="text-[#162361] font-bold">AI Trade Pro</span>.
                 </p>

                 <button 
                   onClick={handleFinalClose}
                   className="w-full bg-[#162361] text-white font-bold text-[17px] py-4 rounded-[24px] shadow-lg active:scale-95 transition-transform hover:bg-[#0e1640]"
                 >
                   Start Trading
                 </button>
               </div>
             )}
             
          </div>
       </div>
    </div>
  );
};
