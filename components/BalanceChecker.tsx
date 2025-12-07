"use client";

import {
  useAccount,
  useConnect,
  useDisconnect,
  useSwitchChain,
  useChainId,
} from "wagmi";
import { useState, useEffect } from "react";
import { formatUnits } from "viem"; // Using viem's formatUnits for consistency

interface TokenBalance {
  contractAddress: string;
  tokenName: string;
  tokenSymbol: string;
  logoUrl?: string;
  balance: string; // Already formatted
  usdValue?: number;
}

export function BalanceChecker() {
  const { address: connectedAddress, isConnected, chain } = useAccount();
  const {
    connectors,
    connect,
    status: connectStatus,
    error: connectError,
  } = useConnect();
  const { disconnect } = useDisconnect();
  const { chains, switchChain } = useSwitchChain();
  const currentChainId = useChainId(); // Get current active chain ID from wagmi

  const [manualAddressInput, setManualAddressInput] = useState<string>("");
  const [targetAddress, setTargetAddress] = useState<string | undefined>(
    undefined,
  );
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState<boolean>(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  // Set targetAddress based on connection or manual input
  useEffect(() => {
    if (isConnected && connectedAddress) {
      setTargetAddress(connectedAddress);
    } else if (manualAddressInput) {
      setTargetAddress(manualAddressInput);
    } else {
      setTargetAddress(undefined);
    }
  }, [isConnected, connectedAddress, manualAddressInput]);

  const fetchBalances = async () => {
    if (!targetAddress || !currentChainId) {
      setBalanceError(
        "Please connect wallet or enter an address and select a chain.",
      );
      return;
    }

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
          walletAddress: targetAddress,
          chainId: currentChainId,
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
        {/* Wallet Connection Section */}
        {!isConnected && (
          <div className="mb-8 p-4 bg-blue-50 rounded-md">
            <h2 className="text-2xl font-semibold mb-4 text-center text-blue-800">
              Connect Your Wallet
            </h2>
            <div className="space-y-4">
              {connectors.map((connector) => (
                <button
                  disabled={!connector.ready}
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-md text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {connector.name}
                  {!connector.ready && " (unsupported)"}
                  {connectStatus === "pending" &&
                    connector.id === connector.id &&
                    " (connecting)"}
                </button>
              ))}
            </div>
            {connectError && (
              <div className="text-red-500 mt-4 text-center">
                {connectError.message}
              </div>
            )}
          </div>
        )}

        {/* Connected Wallet Info & Disconnect */}
        {isConnected && (
          <div className="text-center mb-8 p-4 bg-green-50 rounded-md">
            <p className="text-lg text-green-800">
              Connected to{" "}
              <span className="font-semibold">
                {connectedAddress?.slice(0, 6)}...{connectedAddress?.slice(-4)}
              </span>
            </p>
            {chain && (
              <p className="text-md text-gray-700">
                on <span className="font-semibold">{chain.name}</span> (ID:{" "}
                {chain.id})
              </p>
            )}
            <button
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              onClick={() => disconnect()}
            >
              Disconnect
            </button>
          </div>
        )}

        {/* Chain Switcher */}
        <div className="mt-6 p-4 bg-gray-100 rounded-md mb-8">
          <h3 className="text-xl font-semibold mb-2 text-center">
            Select Chain
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {chains.map((x) => (
              <button
                key={x.id}
                onClick={() => switchChain({ chainId: x.id })}
                disabled={currentChainId === x.id}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  currentChainId === x.id
                    ? "bg-blue-600 text-white cursor-default"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {x.name}
              </button>
            ))}
          </div>
        </div>

        {/* Balance Checker Input & Button */}
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
            onClick={fetchBalances}
          >
            {isLoadingBalances ? "Fetching Balances..." : "Fetch Balances"}
          </button>

          {/* Balance Results Section */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Token Balances
            </h3>
            {balanceError && (
              <div className="text-red-500 text-center mb-4">
                {balanceError}
              </div>
            )}

            {isLoadingBalances && (
              <p className="text-center text-gray-600">Loading balances...</p>
            )}

            {!isLoadingBalances && balances.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-md">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">Token</th>
                      <th className="py-2 px-4 border-b">Balance</th>
                      <th className="py-2 px-4 border-b">USD Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {balances.map((token) => (
                      <tr key={token.contractAddress}>
                        <td className="py-2 px-4 border-b flex items-center">
                          {token.logoUrl && (
                            <img
                              src={token.logoUrl}
                              alt={token.tokenSymbol}
                              className="w-6 h-6 mr-2 rounded-full"
                            />
                          )}
                          {token.tokenName} ({token.tokenSymbol})
                        </td>
                        <td className="py-2 px-4 border-b">{token.balance}</td>
                        <td className="py-2 px-4 border-b">
                          {token.usdValue
                            ? `$${token.usdValue.toFixed(2)}`
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!isLoadingBalances &&
              !balanceError &&
              balances.length === 0 &&
              targetAddress && (
                <p className="text-center text-gray-600">
                  No ERC-20 tokens found for this address on the selected chain.
                </p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
