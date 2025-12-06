// app/api/balances/route.ts
import 'dotenv/config'; // Ensure environment variables are loaded
import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

// --- Configuration for RPC Failover ---
// IMPORTANT: Replace with your actual RPC URLs and API keys
const RPC_CONFIG: Record<number, string[]> = {
  1: [ // Ethereum Mainnet
    process.env.ETH_RPC_URL_1 || 'https://ethereum.publicnode.com',
    process.env.ETH_RPC_URL_2 || 'https://rpc.ankr.com/eth', // Example backup RPC
  ],
  137: [ // Polygon Mainnet
    process.env.POLYGON_RPC_URL_1 || 'https://polygon-rpc.com',
    process.env.POLYGON_RPC_URL_2 || 'https://rpc-mainnet.matic.network', // Example backup RPC
  ],
  42161: [ // Arbitrum One
    process.env.ARBITRUM_RPC_URL_1 || 'https://arb1.arbitrum.io/rpc',
    process.env.ARBITRUM_RPC_URL_2 || 'https://arbitrum-one.public.blastapi.io', // Example backup RPC
  ],
  8453: [ // Base
    process.env.BASE_RPC_URL_1 || 'https://base.publicnode.com',
    process.env.BASE_RPC_URL_2 || 'https://mainnet.base.org', // Example backup RPC
  ],
};

const COVALENT_API_KEY = process.env.COVALENT_API_KEY;
const COVALENT_API_BASE_URL = 'https://api.covalenthq.com/v1';

// --- Helper function for RPC Failover ---
async function fetchWithFailover<T>(
  chainId: number,
  rpcMethod: string,
  rpcParams: any[],
  maxRetries = 3,
): Promise<T> {
  const rpcs = RPC_CONFIG[chainId];
  if (!rpcs || rpcs.length === 0) {
    throw new Error(`No RPC URLs configured for chainId: ${chainId}`);
  }

  for (let i = 0; i < rpcs.length; i++) {
    const rpcUrl = rpcs[i];
    console.log(`Attempting RPC call to ${rpcUrl} for chain ${chainId} (Attempt ${i + 1}/${rpcs.length})`);
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      // Example: For a simple getBlockNumber or similar direct RPC call
      // For contract calls, we'd instantiate the contract with this provider.
      // For now, let's just make a generic call if possible or simulate the success.

      // This is a placeholder for actual RPC interaction for failover testing.
      // In a real scenario, you'd integrate this with contract calls or provider methods.
      // For this example, let's assume if provider instantiation succeeds, it's 'healthy'
      // The actual logic would involve timing out actual calls or checking specific errors.
      const blockNumber = await provider.getBlockNumber(); // Simple call to check provider health
      console.log(`Successfully connected to ${rpcUrl}, block number: ${blockNumber}`);
      
      // Simulate calling the actual method if needed, otherwise return provider for further use
      // For now, we'll just indicate success and let subsequent logic use Covalent.
      // This failover logic would primarily apply if we were making direct `ethers` calls here.
      // Since we're using Covalent for balances, this section primarily tests RPC health.

      return {} as T; // Return dummy data for now, Covalent will do the heavy lifting
    } catch (error: any) {
      console.error(`RPC ${rpcUrl} failed for chain ${chainId}: ${error.message}`);
      if (i === rpcs.length - 1) {
        throw new Error(`All RPC providers failed for chainId ${chainId}: ${error.message}`);
      }
      // Implement a delay before retrying the next RPC
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff example
    }
  }
  throw new Error("Should not reach here");
}


// --- Function to fetch balances from Covalent ---
async function fetchCovalentBalances(walletAddress: string, chainId: number) {
  if (!COVALENT_API_KEY) {
    throw new Error('COVALENT_API_KEY is not set in environment variables.');
  }
  if (!walletAddress || !chainId) {
    throw new Error('Wallet address and chain ID are required.');
  }

  const covalentChainId = chainId; // Covalent often uses the same chain IDs
  const url = `${COVALENT_API_BASE_URL}/${covalentChainId}/address/${walletAddress}/balances_v2/?key=${COVALENT_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      // Check for rate limits or other API errors
      if (response.status === 429) {
        console.warn('Covalent API rate limit exceeded.');
        // Implement retry logic or fall back to direct RPC if possible (more complex)
      }
      throw new Error(`Covalent API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.data.items; // Array of token balance objects
  } catch (error: any) {
    console.error('Error fetching from Covalent API:', error);
    throw new Error(`Failed to fetch balances from Covalent: ${error.message}`);
  }
}

// --- Main API Route Handler ---
export async function POST(req: NextRequest) {
  try {
    const { walletAddress, chainId } = await req.json();

    if (!walletAddress || !chainId) {
      return NextResponse.json(
        { error: 'walletAddress and chainId are required' },
        { status: 400 },
      );
    }

    // Example of using RPC failover (e.g., to ensure RPCs are healthy before Covalent call, or for direct RPC calls)
    // For this specific use case (Covalent balances), the primary failover is for Covalent itself.
    // However, the `fetchWithFailover` concept is implemented for demonstration of NFR3.
    // In a full implementation, `fetchWithFailover` would wrap direct `ethers` calls.
    // For now, we'll just test a basic RPC call via failover.
    await fetchWithFailover(chainId, 'getBlockNumber', []); 

    const rawBalances = await fetchCovalentBalances(walletAddress, chainId);

    const formattedBalances = rawBalances
      .filter((item: any) => item.contract_address !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') // Filter out native token if preferred, or handle separately
      .map((item: any) => ({
        contractAddress: item.contract_address,
        tokenName: item.contract_name,
        tokenSymbol: item.contract_ticker_symbol,
        logoUrl: item.logo_url,
        balance: ethers.formatUnits(item.balance, item.contract_decimals),
        usdValue: item.quote, // Covalent provides quote in USD
      }));

    return NextResponse.json({ balances: formattedBalances });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}