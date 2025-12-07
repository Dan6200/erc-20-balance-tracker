"use client";

import { useState, useEffect } from "react";
import { useAccount, useChainId, useConnect } from "wagmi";

import { WalletConnect } from "./WalletConnect";
import { WalletInfo } from "./WalletInfo";
import { ChainSwitcher } from "./ChainSwitcher";
import { BalanceInputForm } from "./BalanceInputForm";
import { BalanceDisplay } from "./BalanceDisplay";

interface TokenBalance {
  contractAddress: string;
  tokenName: string;
  tokenSymbol: string;
  logoUrl?: string;
  balance: string; // Already formatted
  usdValue?: number;
}

export function BalanceChecker() {
  const { address: connectedAddress, isConnected } = useAccount();
  const { status: connectStatus, error: connectError } = useConnect();
  const currentChainId = useChainId();

  const [manualAddressInput, setManualAddressInput] = useState<string>(""); // For the input field value
  const [targetAddress, setTargetAddress] = useState<string | undefined>(
    undefined,
  ); // The address to actually query
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState<boolean>(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  // Determine the target address for balance fetching
  useEffect(() => {
    if (isConnected && connectedAddress) {
      setTargetAddress(connectedAddress);
    } else if (manualAddressInput) {
      setTargetAddress(manualAddressInput);
    } else {
      setTargetAddress(undefined);
    }
  }, [isConnected, connectedAddress, manualAddressInput]);

  const fetchBalances = async (
    addressToFetch: string,
    chainIdToFetch: number,
  ) => {
    setIsLoadingBalances(true);
    setBalanceError(null);
    setBalances([]);

    try {
      const response = await fetch("/api/balances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: addressToFetch,
          chainId: chainIdToFetch,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Error ${response.status}: Failed to fetch balances`,
        );
      }

      const data = await response.json();
      setBalances(data.balances);
    } catch (err: any) {
      console.error("Failed to fetch balances:", err);
      setBalanceError(
        err.message || "An unexpected error occurred while fetching balances.",
      );
    } finally {
      setIsLoadingBalances(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4 bg-gray-50">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        Multi-Chain Token Tracker
      </h1>

      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-xl border border-gray-200">
        {!isConnected ? (
          <WalletConnect
            connectStatus={connectStatus}
            connectError={connectError}
          />
        ) : (
          <WalletInfo />
        )}

        <ChainSwitcher />

        <BalanceInputForm
          isLoadingBalances={isLoadingBalances}
          onFetchBalances={fetchBalances}
          setBalanceError={setBalanceError}
        />

        <BalanceDisplay
          balances={balances}
          isLoadingBalances={isLoadingBalances}
          balanceError={balanceError}
          targetAddress={targetAddress}
        />
      </div>
    </div>
  );
}
