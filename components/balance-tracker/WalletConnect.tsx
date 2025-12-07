"use client";

import { useConnect } from "wagmi";

export function WalletConnect({
  connectStatus,
  connectError,
}: {
  connectStatus: ReturnType<typeof useConnect>["status"];
  connectError: ReturnType<typeof useConnect>["error"];
}) {
  const { connectors, connect } = useConnect();

  return (
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
  );
}
