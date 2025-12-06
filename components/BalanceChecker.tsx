'use client';

import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { useState } from 'react'; // Import useState

export function BalanceChecker() {
  const { address, isConnected, chain } = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { chains, switchChain } = useSwitchChain();

  const [manualAddress, setManualAddress] = useState<string>(''); // State for manual address input

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4">
      <h1 className="text-4xl font-bold text-center mb-8">Multi-Chain Token Tracker</h1>

      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl border border-gray-200">
        {!isConnected && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-center">Connect Your Wallet</h2>
            <div className="space-y-4">
              {connectors.map((connector) => (
                <button
                  disabled={!connector.ready}
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-md text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {connector.name}
                  {!connector.ready && ' (unsupported)'}
                  {status === 'pending' && connector.id === connector.id && ' (connecting)'}
                </button>
              ))}
            </div>
            {error && <div className="text-red-500 mt-4 text-center">{error.message}</div>}
          </div>
        )}

        {isConnected && (
          <div className="text-center mb-8">
            <p className="text-lg">Connected to <span className="font-semibold">{address?.slice(0, 6)}...{address?.slice(-4)}</span></p>
            {chain && <p className="text-md text-gray-600">on {chain.name}</p>}
            <button
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              onClick={() => disconnect()}
            >
              Disconnect
            </button>
            
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">Switch Chain</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {chains.map((x) => (
                  <button
                    key={x.id}
                    onClick={() => switchChain({ chainId: x.id })}
                    disabled={chain?.id === x.id}
                    className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:bg-blue-500 disabled:text-white"
                  >
                    {x.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 border rounded-md bg-gray-50">
          <h2 className="text-2xl font-semibold mb-4 text-center">Check Token Balances</h2>
          <input
            type="text"
            placeholder={isConnected ? `Using connected address: ${address}` : "Enter Wallet Address (0x...)"}
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isConnected} // Disable if wallet is connected
          />
          <button
            className="w-full px-6 py-3 bg-green-600 text-white rounded-md text-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isConnected ? false : !manualAddress} // Enable if connected or manual address is entered
            onClick={() => { /* Logic to fetch balances for manualAddress or connected address */ }}
          >
            Fetch Balances
          </button>

          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2">Results</h3>
            <p>Placeholder for balance display...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
