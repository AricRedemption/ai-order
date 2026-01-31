'use client';

import React, { useCallback, useEffect, useState } from 'react';
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
  const [solanaAddress, setSolanaAddress] = useState<string | null>(null);
  const [evmAddress, setEvmAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const disconnectPhantom = useCallback(() => {
    setSolanaAddress(null);
    localStorage.removeItem('wallet-address-solana');
    try {
      window.solana?.disconnect?.();
    } catch (error) {
      console.error('Phantom disconnect error:', error);
    }
    onDisconnect?.();
  }, [onDisconnect]);

  const disconnectMetaMask = useCallback(() => {
    setEvmAddress(null);
    localStorage.removeItem('wallet-address-evm');
    onDisconnect?.();
  }, [onDisconnect]);

  useEffect(() => {
    const legacyAddress = localStorage.getItem('wallet-address');
    const legacyType = localStorage.getItem('wallet-type') as WalletType;
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

    // Listen for account changes
    if (typeof window !== 'undefined') {
      const cleanups: Array<() => void> = [];

      // Phantom (Solana)
      if (window.solana) {
        const phantomHandler = (publicKey: any) => {
          if (publicKey) {
            const address = publicKey.toString();
            setSolanaAddress(address);
            localStorage.setItem('wallet-address-solana', address);
          } else {
            disconnectPhantom();
          }
        };
        window.solana.on('accountChanged', phantomHandler);
        cleanups.push(() => {
          try {
            window.solana?.removeListener?.('accountChanged', phantomHandler);
          } catch {}
        });
      }

      // MetaMask (Ethereum/BNB)
      if (window.ethereum) {
        const metamaskHandler = (accounts: string[]) => {
          if (accounts.length > 0) {
            setEvmAddress(accounts[0]);
            localStorage.setItem('wallet-address-evm', accounts[0]);
          } else {
            disconnectMetaMask();
          }
        };
        window.ethereum.on('accountsChanged', metamaskHandler);
        cleanups.push(() => {
          try {
            window.ethereum?.removeListener?.('accountsChanged', metamaskHandler);
          } catch {}
        });
      }

      return () => {
        for (const cleanup of cleanups) cleanup();
      };
    }
  }, [disconnectMetaMask, disconnectPhantom]);

  const switchToBsc = async () => {
    if (typeof window === 'undefined' || !window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }],
      });
    } catch (switchError: any) {
      if (switchError?.code === 4902) {
        await window.ethereum.request({
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

  const connectPhantom = async () => {
    setIsConnecting(true);

    try {
      // Check if Phantom is installed
      if (typeof window !== 'undefined' && window.solana && window.solana.isPhantom) {
        const response = await window.solana.connect();
        const address = response.publicKey.toString();

        setSolanaAddress(address);
        localStorage.setItem('wallet-address-solana', address);

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

          setEvmAddress(address);
          localStorage.setItem('wallet-address-evm', address);
          await switchToBsc();

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

  return (
    <div className="flex flex-wrap items-center gap-2">
      {solanaAddress ? (
        <>
          <Badge variant="outline" className="px-2 py-0.5">
            <Wallet className="w-3 h-3 mr-2" />
            Phantom
          </Badge>
          <Button
            variant="outline"
            size="sm"
            className="px-2 sm:px-3 text-xs sm:text-sm"
            onClick={() => window.open(`https://solscan.io/account/${solanaAddress}`, '_blank')}
          >
            {truncateAddress(solanaAddress)}
            <ExternalLink className="w-3 h-3 ml-2" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="px-2 sm:px-3 text-xs sm:text-sm"
            onClick={disconnectPhantom}
          >
            断开
          </Button>
        </>
      ) : (
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
      )}

      {evmAddress ? (
        <>
          <Badge variant="outline" className="px-2 py-0.5">
            <Wallet className="w-3 h-3 mr-2" />
            MetaMask
          </Badge>
          <Button
            variant="outline"
            size="sm"
            className="px-2 sm:px-3 text-xs sm:text-sm"
            onClick={() => window.open(`https://bscscan.com/address/${evmAddress}`, '_blank')}
          >
            {truncateAddress(evmAddress)}
            <ExternalLink className="w-3 h-3 ml-2" />
          </Button>
          <Button variant="ghost" size="sm" className="px-2 sm:px-3 text-xs sm:text-sm" onClick={disconnectMetaMask}>
            断开
          </Button>
        </>
      ) : (
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
      )}
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
