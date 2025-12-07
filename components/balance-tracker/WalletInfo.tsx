"use client";

import { useAccount, useDisconnect } from "wagmi";

export function WalletInfo() {
  const { address, chain } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <div className="text-center mb-8 p-4 bg-green-50 rounded-md">
      <p className="text-lg text-green-800">
        Connected to{" "}
        <span className="font-semibold">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
      </p>
      {chain && (
        <p className="text-md text-gray-700">
          on <span className="font-semibold">{chain.name}</span> (ID: {chain.id}
          )
        </p>
      )}
      <button
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        onClick={() => disconnect()}
      >
        Disconnect
      </button>
    </div>
  );
}
