"use client";

interface TokenBalance {
  contractAddress: string;
  tokenName: string;
  tokenSymbol: string;
  logoUrl?: string;
  balance: string; // Already formatted
  usdValue?: number;
}

interface BalanceDisplayProps {
  balances: TokenBalance[];
  isLoadingBalances: boolean;
  balanceError: string | null;
  targetAddress: string | undefined;
}

export function BalanceDisplay({
  balances,
  isLoadingBalances,
  balanceError,
  targetAddress,
}: BalanceDisplayProps) {
  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-4 text-center">Token Balances</h3>
      {balanceError && (
        <div className="text-red-500 text-center mb-4">{balanceError}</div>
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
                    {token.usdValue ? `$${token.usdValue.toFixed(2)}` : "N/A"}
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
  );
}
