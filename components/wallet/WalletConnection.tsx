'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, ExternalLink } from 'lucide-react';
import { truncateAddress } from '@/lib/utils/formatters';

type WalletType = 'phantom' | 'metamask' | null;

interface WalletConnectionProps {
  onConnect?: (address: string, type: WalletType) => void;
  onDisconnect?: () => void;
}

export function WalletConnection({ onConnect, onDisconnect }: WalletConnectionProps) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Check if wallet was previously connected
    const savedAddress = localStorage.getItem('wallet-address');
    const savedType = localStorage.getItem('wallet-type') as WalletType;

    if (savedAddress && savedType) {
      setWalletAddress(savedAddress);
      setWalletType(savedType);
    }

    // Listen for account changes
    if (typeof window !== 'undefined') {
      // Phantom (Solana)
      if (window.solana) {
        window.solana.on('accountChanged', (publicKey: any) => {
          if (publicKey) {
            const address = publicKey.toString();
            setWalletAddress(address);
            localStorage.setItem('wallet-address', address);
          } else {
            handleDisconnect();
          }
        });
      }

      // MetaMask (Ethereum/BNB)
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            localStorage.setItem('wallet-address', accounts[0]);
          } else {
            handleDisconnect();
          }
        });
      }
    }
  }, []);

  const connectPhantom = async () => {
    setIsConnecting(true);

    try {
      // Check if Phantom is installed
      if (typeof window !== 'undefined' && window.solana && window.solana.isPhantom) {
        const response = await window.solana.connect();
        const address = response.publicKey.toString();

        setWalletAddress(address);
        setWalletType('phantom');

        // Save to localStorage
        localStorage.setItem('wallet-address', address);
        localStorage.setItem('wallet-type', 'phantom');

        onConnect?.(address, 'phantom');
      } else {
        alert('Phantom 钱包未安装！\n请访问 https://phantom.app 安装 Phantom 钱包。');
        window.open('https://phantom.app', '_blank');
      }
    } catch (error) {
      console.error('Phantom connection error:', error);
      alert('连接 Phantom 失败，请重试');
    } finally {
      setIsConnecting(false);
    }
  };

  const connectMetaMask = async () => {
    setIsConnecting(true);

    try {
      // Check if MetaMask is installed
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });

        if (accounts.length > 0) {
          const address = accounts[0];

          setWalletAddress(address);
          setWalletType('metamask');

          // Save to localStorage
          localStorage.setItem('wallet-address', address);
          localStorage.setItem('wallet-type', 'metamask');

          // Switch to BSC network
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x38' }], // BSC Mainnet
            });
          } catch (switchError: any) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0x38',
                    chainName: 'BNB Smart Chain',
                    nativeCurrency: {
                      name: 'BNB',
                      symbol: 'BNB',
                      decimals: 18,
                    },
                    rpcUrls: ['https://bsc-dataseed.binance.org'],
                    blockExplorerUrls: ['https://bscscan.com'],
                  },
                ],
              });
            }
          }

          onConnect?.(address, 'metamask');
        }
      } else {
        alert('MetaMask 未安装！\n请访问 https://metamask.io 安装 MetaMask 钱包。');
        window.open('https://metamask.io', '_blank');
      }
    } catch (error) {
      console.error('MetaMask connection error:', error);
      alert('连接 MetaMask 失败，请重试');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
    setWalletType(null);
    localStorage.removeItem('wallet-address');
    localStorage.removeItem('wallet-type');
    onDisconnect?.();
  };

  if (walletAddress && walletType) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="px-2 py-0.5">
          <Wallet className="w-3 h-3 mr-2" />
          {walletType === 'phantom' ? 'Phantom' : 'MetaMask'}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          className="px-2 sm:px-3 text-xs sm:text-sm"
          onClick={() => {
            const explorerUrl =
              walletType === 'phantom'
                ? `https://solscan.io/account/${walletAddress}`
                : `https://bscscan.com/address/${walletAddress}`;
            window.open(explorerUrl, '_blank');
          }}
        >
          {truncateAddress(walletAddress)}
          <ExternalLink className="w-3 h-3 ml-2" />
        </Button>
        <Button variant="ghost" size="sm" className="px-2 sm:px-3 text-xs sm:text-sm" onClick={handleDisconnect}>
          断开
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="px-2 sm:px-3 text-xs sm:text-sm"
        onClick={connectPhantom}
        disabled={isConnecting}
      >
        <Wallet className="w-4 h-4 mr-2" />
        Phantom
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="px-2 sm:px-3 text-xs sm:text-sm"
        onClick={connectMetaMask}
        disabled={isConnecting}
      >
        <Wallet className="w-4 h-4 mr-2" />
        MetaMask
      </Button>
    </div>
  );
}

// Type declarations for wallet extensions
declare global {
  interface Window {
    solana?: any;
    ethereum?: any;
  }
}
