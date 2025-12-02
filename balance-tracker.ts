import { ethers, JsonRpcProvider } from "ethers";

// --- CONFIGURATION ---

// NOTE: For better performance and reliability, replace this with your own dedicated
// RPC URL (e.g., from Alchemy or Infura). Use environment variables in a real project.
// We use a public endpoint here for portability.
const RPC_PROVIDER_URL = 'https://ethereum.publicnode.com';

// The address you want to check (e.g., a well-known address for demonstration)
const TARGET_WALLET_ADDRESS = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"; // Vitalik Buterin's address

// The contract address for the ERC-20 token (e.g., USDC on Ethereum Mainnet)
const TOKEN_CONTRACT_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC Contract Address

// Standard ERC-20 ABI subset required to call the `balanceOf` and `decimals` functions
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)",
];

/**
 * Converts a raw BigInt balance (including decimals) into a human-readable number.
 * @param rawBalance The balance returned from the smart contract (as BigInt).
 * @param decimals The number of decimals the token uses (e.g., 6 for USDC, 18 for ETH).
 * @returns A formatted string of the token balance.
 */
function formatTokenBalance(rawBalance: bigint, decimals: number): string {
  // We use the formatUnits utility from ethers to handle the large number and precision.
  return ethers.formatUnits(rawBalance, decimals);
}

/**
 * Main function to retrieve and display the ERC-20 token balance.
 * Implements exponential backoff for robust API fetching.
 */
async function getERC20Balance() {
  console.log(`\n--- ERC-20 Token Balance Tracker ---`);
  console.log(`RPC Provider: ${RPC_PROVIDER_URL}`);
  console.log(`Target Wallet: ${TARGET_WALLET_ADDRESS}`);

  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;
    try {
      // 1. Initialize the Provider (Connect to the EVM Network)
      const provider = new JsonRpcProvider(RPC_PROVIDER_URL);

      // 2. Initialize the Contract Interface
      const tokenContract = new ethers.Contract(
        TOKEN_CONTRACT_ADDRESS,
        ERC20_ABI,
        provider,
      );

      // 3. Read Contract Metadata (Name and Decimals)
      const tokenName = await tokenContract.name();
      const tokenSymbol = await tokenContract.symbol();
      // Convert Decimals from BigInt to Number
      const decimals = Number(await tokenContract.decimals());

      // 4. Call the `balanceOf` function (Smart Contract Read)
      console.log(
        `\nFetching ${tokenName} (${tokenSymbol}) balance on attempt ${attempt}...`,
      );

      const rawBalance: bigint = await tokenContract.balanceOf(
        TARGET_WALLET_ADDRESS,
      );

      // 5. Format and Display Result
      const formattedBalance = formatTokenBalance(rawBalance, decimals);

      console.log(`\n✅ Success!`);
      console.log(`   Token Name:    ${tokenName} (${tokenSymbol})`);
      console.log(`   Token Address: ${TOKEN_CONTRACT_ADDRESS}`);
      console.log(`   Decimals:      ${decimals}`);
      console.log(`   Raw Balance:   ${rawBalance.toString()}`);
      console.log(
        `   Balance for ${TARGET_WALLET_ADDRESS}: ${formattedBalance} ${tokenSymbol}`,
      );

      return; // Exit successfully
    } catch (error) {
      console.error(
        `\n❌ Error on attempt ${attempt}: Could not complete Web3 operation.`,
      );
      if (attempt === maxRetries) {
        console.error(
          "   Maximum retries reached. Please check the network configuration and RPC URL.",
        );
        console.error(error);
        throw new Error("Failed to retrieve balance after multiple retries.");
      }
      // Implement exponential backoff delay
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`   Retrying in ${delay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// Execute the main function
getERC20Balance();
