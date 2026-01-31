'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, ExternalLink, Copy } from 'lucide-react';
import { truncateAddress } from '@/lib/utils/formatters';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  
  // Separate states for each chain
  const [solanaAddress, setSolanaAddress] = useState<string | null>(null);
  const [evmAddress, setEvmAddress] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    // 1. Initialize from LocalStorage
    const legacyAddress = localStorage.getItem('wallet-address');
    const legacyType = localStorage.getItem('wallet-type') as 'phantom' | 'metamask' | null;
    const savedSol = localStorage.getItem('wallet-address-solana');
    const savedEvm = localStorage.getItem('wallet-address-evm');

    if (legacyAddress && legacyType) {
      if (legacyType === 'phantom' && !savedSol) {
        localStorage.setItem('wallet-address-solana', legacyAddress);
      }
      if (legacyType === 'metamask' && !savedEvm) {
        localStorage.setItem('wallet-address-evm', legacyAddress);
      }
      localStorage.removeItem('wallet-address');
      localStorage.removeItem('wallet-type');
    }

    const nextSol = localStorage.getItem('wallet-address-solana');
    const nextEvm = localStorage.getItem('wallet-address-evm');

    if (nextSol) setSolanaAddress(nextSol);
    if (nextEvm) setEvmAddress(nextEvm);

    // 2. Setup Event Listeners
    if (typeof window !== 'undefined') {
      // Phantom (Solana)
      if ((window as any).solana) {
        // Handle account changes
        (window as any).solana.on('accountChanged', (publicKey: any) => {
          if (publicKey) {
            const address = publicKey.toString();
            setSolanaAddress(address);
            localStorage.setItem('wallet-address-solana', address);
          } else {
            // Disconnected via wallet UI
            handleDisconnect('phantom');
          }
        });
        
        // Check if already connected (auto-connect)
        // Note: avoiding aggressive auto-connect if not trusted, but we can check if we have permission
        // For simplicity, we rely on the localStorage + manual connect flow or the listener updates
      }

      // MetaMask (EVM)
      if ((window as any).ethereum) {
        (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length > 0) {
            setEvmAddress(accounts[0]);
            localStorage.setItem('wallet-address-evm', accounts[0]);
          } else {
            handleDisconnect('metamask');
          }
        });
      }
    }
  }, []);

  const handleNavClick = () => {
    onClose();
  };

  const handleDisconnect = (type: 'phantom' | 'metamask') => {
    if (type === 'phantom') {
      setSolanaAddress(null);
      localStorage.removeItem('wallet-address-solana');
      try {
        (window as any).solana?.disconnect?.();
      } catch (error) {
        console.error('Phantom disconnect error:', error);
      }
    } else {
      setEvmAddress(null);
      localStorage.removeItem('wallet-address-evm');
    }
  };

  if (!isVisible && !isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-[100] h-screen w-screen pointer-events-none">
      
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-[#162361]/40 backdrop-blur-[2px] transition-opacity duration-300 pointer-events-auto ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      ></div>

      {/* Dropdown Menu */}
      <div 
        className={`absolute top-[24px] right-6 w-[280px] bg-white rounded-[28px] shadow-2xl flex flex-col origin-top-right transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-auto ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 -translate-y-6'}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-6 pb-4">
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Menu</span>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors active:scale-90"
          >
            <svg width="10" height="10" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.5 3.5L10.5 10.5M3.5 10.5L10.5 3.5" stroke="#162361" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col px-6 pb-8">
           {/* Navigation */}
           <div className="flex flex-col space-y-3 mt-1">
             <MenuItem href="/" icon="home" label="Home" isActive={pathname === '/'} onClick={handleNavClick} />
             <MenuItem href="/dashboard/assistant" icon="ai" label="AI Assistant" isActive={pathname === '/dashboard/assistant'} onClick={handleNavClick} />
             <MenuItem href="/dashboard/memes" icon="memes" label="Hot Memes" isActive={pathname === '/dashboard/memes'} onClick={handleNavClick} />
             <MenuItem href="/dashboard/orders" icon="orders" label="Orders" isActive={pathname === '/dashboard/orders'} onClick={handleNavClick} />
             <MenuItem href="/settings" icon="settings" label="Settings" isActive={pathname === '/settings'} onClick={handleNavClick} />
           </div>

           {/* Dashed Divider */}
           <div className="my-6 border-t border-dashed border-gray-200"></div>

           {/* Connect Wallet Section */}
           <div className="flex flex-col">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 pl-1">
                Wallets
              </h3>
              
              <div className="space-y-3">
                {/* Phantom (Solana) */}
                {solanaAddress ? (
                  <ConnectedWalletCard 
                    type="phantom" 
                    address={solanaAddress} 
                    onDisconnect={() => handleDisconnect('phantom')} 
                  />
                ) : (
                   <WalletButton 
                      name="Phantom" 
                      bgColor="#F4F1FF" 
                      borderColor="rgba(171, 159, 242, 0.2)"
                      iconColor="#AB9FF2"
                      icon="ghost"
                      onConnect={(address) => {
                        setSolanaAddress(address);
                        localStorage.setItem('wallet-address-solana', address);
                      }}
                   />
                )}

                {/* MetaMask (EVM) */}
                {evmAddress ? (
                  <ConnectedWalletCard 
                    type="metamask" 
                    address={evmAddress} 
                    onDisconnect={() => handleDisconnect('metamask')} 
                  />
                ) : (
                   <WalletButton 
                      name="MetaMask" 
                      bgColor="#FFF5EB" 
                      borderColor="rgba(246, 133, 27, 0.2)"
                      iconColor="#F6851B"
                      icon="fox" 
                      onConnect={(address) => {
                        setEvmAddress(address);
                        localStorage.setItem('wallet-address-evm', address);
                      }}
                   />
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- Subcomponents ---

interface MenuItemProps {
  href: string;
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ href, icon, label, isActive, onClick }) => {
  return (
    <Link 
      href={href}
      onClick={onClick}
      className="flex items-center space-x-4 w-full p-1 rounded-xl group active:opacity-60 transition-opacity"
    >
       <div className={`w-10 h-10 rounded-[14px] border shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center transition-all ${
         isActive 
           ? 'bg-[#162361] border-[#162361] text-white' 
           : 'bg-white border-gray-100 text-[#162361] group-hover:text-black group-hover:border-gray-300'
       }`}>
          {renderIcon(icon)}
       </div>
       <span className={`text-[14px] font-extrabold tracking-tight ${isActive ? 'text-[#162361]' : 'text-[#162361]'}`}>{label}</span>
    </Link>
  );
};

interface WalletButtonProps {
  name: string;
  bgColor: string;
  borderColor: string;
  iconColor: string;
  icon: 'ghost' | 'fox';
  onConnect: (address: string) => void;
}

const WalletButton: React.FC<WalletButtonProps> = ({ name, bgColor, borderColor, iconColor, icon, onConnect }) => {
  const handleConnect = async () => {
    try {
      if (icon === 'ghost') {
        if (typeof window !== 'undefined' && (window as any).solana && (window as any).solana.isPhantom) {
           const response = await (window as any).solana.connect();
           const address = response.publicKey.toString();
           onConnect(address);
        } else {
          window.open('https://phantom.app', '_blank');
        }
      } else {
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          const switchToBsc = async () => {
            try {
              await (window as any).ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x38' }],
              });
            } catch (switchError: any) {
              if (switchError?.code === 4902) {
                await (window as any).ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId: '0x38',
                      chainName: 'BNB Smart Chain',
                      nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
                      rpcUrls: ['https://bsc-dataseed.binance.org'],
                      blockExplorerUrls: ['https://bscscan.com'],
                    },
                  ],
                });
              }
            }
          };

          const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts.length > 0) {
            await switchToBsc();
            onConnect(accounts[0]);
          }
        } else {
           window.open('https://metamask.io', '_blank');
        }
      }
    } catch (err) {
      console.error('Connection error:', err);
    }
  };

  return (
    <button 
      onClick={handleConnect}
      className="w-full flex items-center justify-between p-3.5 rounded-[20px] border transition-transform active:scale-[0.97]"
      style={{ backgroundColor: bgColor, borderColor: borderColor }}
    >
       <div className="flex items-center space-x-4">
          <div 
            className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm text-white"
            style={{ backgroundColor: iconColor }}
          >
             {icon === 'ghost' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <path d="M12 2C8.5 2 5.5 4.5 5.5 8V18C5.5 19.5 7 21 9 21H15C17 21 18.5 19.5 18.5 18V8C18.5 4.5 15.5 2 12 2Z" fill="white"/>
                   <circle cx="9" cy="10" r="1.5" fill={iconColor}/>
                   <circle cx="15" cy="10" r="1.5" fill={iconColor}/>
                </svg>
             ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <path d="M21 8L18 17H6L3 8L12 2L21 8Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
             )}
          </div>
          <span className="text-[13px] font-bold text-[#162361]">{name}</span>
       </div>
       <div className="w-1.5 h-1.5 rounded-full bg-gray-300/80 mr-1"></div>
    </button>
  );
};

interface ConnectedWalletCardProps {
  type: 'phantom' | 'metamask';
  address: string;
  onDisconnect: () => void;
}

const ConnectedWalletCard: React.FC<ConnectedWalletCardProps> = ({ type, address, onDisconnect }) => {
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
  };

  const handleOpenExplorer = () => {
    const url = type === 'phantom' 
      ? `https://solscan.io/account/${address}`
      : `https://bscscan.com/address/${address}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-slate-50 rounded-[20px] p-4 border border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${type === 'phantom' ? 'bg-[#AB9FF2]' : 'bg-[#F6851B]'}`}></div>
          <span className="text-[12px] font-bold text-gray-500 uppercase">{type}</span>
        </div>
        <div className="flex items-center space-x-1">
          <button onClick={handleCopyAddress} className="p-1.5 text-gray-400 hover:text-[#162361] hover:bg-white rounded-full transition-colors">
            <Copy size={12} />
          </button>
          <button onClick={handleOpenExplorer} className="p-1.5 text-gray-400 hover:text-[#162361] hover:bg-white rounded-full transition-colors">
            <ExternalLink size={12} />
          </button>
          <button onClick={onDisconnect} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-full transition-colors ml-1">
            <LogOut size={12} />
          </button>
        </div>
      </div>
      <div className="text-[16px] font-black text-[#162361] tracking-tight">
        {truncateAddress(address, 6)}
      </div>
    </div>
  );
};

const renderIcon = (type: string) => {
  switch (type) {
    case 'ai':
       return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z"/></svg>;
    case 'orders':
       return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
    case 'settings':
       return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
    case 'home':
       return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    case 'memes':
       return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
    default: return null;
  }
};
