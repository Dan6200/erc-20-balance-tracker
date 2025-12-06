// lib/wagmi.ts
import { http, createConfig } from 'wagmi'
import { mainnet, arbitrum, polygon, base } from 'wagmi/chains' // Import base chain
import {
  coinbaseWallet,
  injected,
  walletConnect,
  metaMask, // Import MetaMask connector
  safe,     // Import Safe connector
} from 'wagmi/connectors'

// To get WalletConnect projectId, visit https://cloud.walletconnect.com
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

export const config = createConfig({
  chains: [mainnet, polygon, arbitrum, base], // Add base chain
  connectors: [
    injected(),
    metaMask(), // Add MetaMask
    safe(),     // Add Safe
    coinbaseWallet({ appName: 'Multi-Chain Token Tracker' }),
    walletConnect({ projectId: walletConnectProjectId }),
  ],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
    [base.id]: http(), // Add transport for base
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
