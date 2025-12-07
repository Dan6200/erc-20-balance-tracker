"use client";

import { useSwitchChain, useChainId } from "wagmi";

export function ChainSwitcher() {
  const { chains, switchChain } = useSwitchChain();
  const currentChainId = useChainId();

  return (
    <div className="mt-6 p-4 bg-gray-100 rounded-md mb-8">
      <h3 className="text-xl font-semibold mb-2 text-center">Select Chain</h3>
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
  );
}
