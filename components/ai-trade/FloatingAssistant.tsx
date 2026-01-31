import React, { useState, useRef, useEffect } from 'react';

interface FloatingAssistantProps {
  onClick: () => void;
}

type InteractionState = 'idle' | 'analyzing' | 'responded';

export const FloatingAssistant: React.FC<FloatingAssistantProps> = ({ onClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [interactionState, setInteractionState] = useState<InteractionState>('idle');
  const [inputValue, setInputValue] = useState('');
  const [displayedResponse, setDisplayedResponse] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Long press logic refs
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);
  
  const [responseIndex, setResponseIndex] = useState(0);
  const MOCK_RESPONSES = [
    "Based on volume spikes, SOL is breaking resistance at $62.80. Momentum is bullish short-term.",
    "ETH is consolidating above $2,100. Support looks strong, but watch for volatility.",
    "Bitcoin dominance is up 0.5% today. Altcoins might bleed slightly against BTC.",
    "JUP just saw a large buy order. Order book depth suggests upward pressure."
  ];

  const handleStart = () => {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      if (navigator.vibrate) navigator.vibrate(50);
      onClick(); 
      setIsOpen(false);
    }, 500);
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!isLongPress.current) {
      toggleBubble();
    }
  };

  const toggleBubble = () => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      setInteractionState('idle');
      setInputValue('');
      setDisplayedResponse('');
      setResponseIndex(0);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    setInteractionState('analyzing');
    setDisplayedResponse('');
    
    setTimeout(() => {
      setInteractionState('responded');
      const nextResponse = MOCK_RESPONSES[responseIndex % MOCK_RESPONSES.length];
      setResponseIndex(prev => prev + 1);
      setInputValue('');
      typeWriterEffect(nextResponse);
      setTimeout(() => inputRef.current?.focus(), 100);
    }, 1500);
  };

  const typeWriterEffect = (text: string) => {
    setDisplayedResponse('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedResponse((prev) => prev + text.charAt(i));
      i++;
      if (i > text.length - 1) clearInterval(interval);
    }, 30);
  };

  useEffect(() => {
    if (isOpen && interactionState === 'idle') {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, interactionState]);

  return (
    <div className="absolute bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Quick Chat Bubble */}
      <div 
         className={`mb-4 mr-1 pointer-events-auto transition-all duration-400 cubic-bezier(0.19, 1, 0.22, 1) origin-bottom-right transform ${
           isOpen 
             ? 'opacity-100 scale-100 translate-y-0 translate-x-0' 
             : 'opacity-0 scale-75 translate-y-8 translate-x-4 pointer-events-none'
         }`}
      >
        <div 
           className="bg-white/95 backdrop-blur-2xl p-5 rounded-[28px] rounded-br-sm shadow-[0_20px_50px_-12px_rgba(22,35,97,0.35)] border border-white/60 w-[280px] flex flex-col relative overflow-hidden"
           onClick={(e) => e.stopPropagation()}
        >
           <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quick Assist</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M1 1l10 10M11 1L1 11"/></svg>
              </button>
           </div>

           <div className="min-h-[60px] mb-3">
              {interactionState === 'idle' && (
                <div className="flex flex-col">
                  <p className="text-[13px] font-bold text-[#162361] leading-snug">
                    您好！我是智能交易助手，请问有什么可以帮您？
                  </p>
                  <span className="text-[9px] font-medium text-slate-400 mt-2 opacity-60">
                    (长按图标进入全屏对话)
                  </span>
                </div>
              )}

              {interactionState === 'analyzing' && (
                 <div className="flex items-center space-x-2 h-full py-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-[#162361] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-1.5 h-1.5 bg-[#162361] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 bg-[#162361] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">正在分析市场行情...</span>
                 </div>
              )}

              {interactionState === 'responded' && (
                <div className="animate-fade-in">
                   <p className="text-[13px] font-bold text-[#162361] leading-snug">
                     {displayedResponse}
                   </p>
                </div>
              )}
           </div>

           {interactionState !== 'analyzing' && (
             <form onSubmit={handleSubmit} className="relative flex items-center">
                <input 
                  ref={inputRef}
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={interactionState === 'responded' ? "继续提问..." : "在此输入指令..."}
                  className="w-full h-10 pl-3 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-[12px] font-bold text-[#162361] placeholder-slate-400 focus:outline-none focus:border-[#007bf4] focus:ring-1 focus:ring-[#007bf4] transition-all"
                />
                <button 
                  type="button"
                  onClick={() => inputValue ? handleSubmit() : setInputValue('分析一下SOL?')} 
                  className="absolute right-1 top-1 w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center hover:bg-slate-50 active:scale-90 transition-all text-slate-600"
                >
                   {inputValue ? (
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
                   ) : (
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                   )}
                </button>
             </form>
           )}
        </div>
      </div>

      {/* 
         Bubble Character Button
      */}
      <div className="flex flex-col items-center space-y-2 pointer-events-auto animate-float">
        <button
          onMouseDown={handleStart}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchEnd={handleEnd}
          className="group outline-none relative active:scale-95 transition-transform duration-200 select-none"
          aria-label="AI SMART ORDER"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {/* External Circle Glow */}
          <div className="absolute inset-0 bg-[#007bf4]/20 rounded-full scale-125 blur-xl group-hover:bg-[#007bf4]/30 transition-all"></div>
          
          <div className="relative w-16 h-16 flex items-center justify-center">
            {/* Bubble Background Shape - Brand Navy #162361 */}
            <div 
              className="absolute inset-0 bg-[#162361] shadow-[0_8px_24px_rgba(22,35,97,0.3)] border border-white/10 rounded-[22px] rounded-br-[4px] transition-all duration-300 group-hover:shadow-[0_12px_32px_rgba(22,35,97,0.4)]"
              style={{
                boxShadow: 'inset 2px 2px 8px rgba(255,255,255,0.08), 0 8px 24px rgba(0,0,0,0.2)'
              }}
            ></div>

            {/* Bubble Face - Eyes and Mouth (Now White for contrast) */}
            <div className="relative z-10 flex flex-col items-center space-y-[4.5px]">
               <div className="flex space-x-[8px]">
                  <div className="w-[5px] h-[8px] bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]"></div>
                  <div className="w-[5px] h-[8px] bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]"></div>
               </div>
               {/* Mouth with animation from global styles */}
               <div className="w-[5px] h-[5px] bg-white rounded-full opacity-90 shadow-[0_0_4px_rgba(255,255,255,0.2)] animate-mouth-talk"></div>
            </div>
          </div>
        </button>
        
        {/* Subtitle Text - Updated to English */}
        <span className="text-[10px] font-black text-[#162361] tracking-tighter bg-white/80 backdrop-blur-sm px-2.5 py-0.5 rounded-full shadow-sm">
          AI SMART ORDER
        </span>
      </div>
    </div>
  );
};
