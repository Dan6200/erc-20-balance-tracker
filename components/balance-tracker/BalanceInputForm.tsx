"use client";

import { useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { isAddress } from "viem"; // Import isAddress from viem

interface BalanceInputFormProps {
  isLoadingBalances: boolean;
  onFetchBalances: (address: string, chainId: number) => void;
  setBalanceError: (error: string | null) => void;
}

export function BalanceInputForm({
  isLoadingBalances,
  onFetchBalances,
  setBalanceError,
}: BalanceInputFormProps) {
  const { address: connectedAddress, isConnected } = useAccount();
  const currentChainId = useChainId();

  const [manualAddressInput, setManualAddressInput] = useState<string>("");

  const targetAddress = isConnected ? connectedAddress : manualAddressInput;

  const handleFetchClick = () => {
    if (!targetAddress || !currentChainId) {
      setBalanceError(
        "Please connect wallet or enter an address and select a chain.",
      );
      return;
    }
    // Basic address validation
    if (!isConnected && !isAddress(targetAddress)) {
      // Use viem's isAddress
      setBalanceError("Invalid Ethereum address entered.");
      return;
    }
    setBalanceError(null); // Clear previous errors
    onFetchBalances(targetAddress, currentChainId);
  };

  return (
    <div className="p-4 border rounded-md bg-white">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Check Token Balances
      </h2>
      <input
        type="text"
        placeholder={
          isConnected
            ? `Using connected address: ${connectedAddress?.slice(0, 6)}...${connectedAddress?.slice(-4)}`
            : "Enter Wallet Address (0x...)"
        }
        value={manualAddressInput}
        onChange={(e) => setManualAddressInput(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isConnected} // Disable if wallet is connected
      />
      <button
        className="w-full px-6 py-3 bg-green-600 text-white rounded-md text-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        disabled={isLoadingBalances || !targetAddress || !currentChainId}
        onClick={handleFetchClick}
      >
        {isLoadingBalances ? "Fetching Balances..." : "Fetch Balances"}
      </button>
    </div>
  );
}
