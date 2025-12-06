# Project Requirements: ERC-20 Web Balance Checker

This document outlines the requirements for a web application that allows users to check ERC-20 token balances for an Ethereum-compatible wallet address.

## 1. Core Objective

To provide a clean, fast, and user-friendly interface for viewing the ERC-20 token holdings of any public wallet address, or the user's own connected wallet, across multiple networks.

## 2. User Personas

*   **Crypto User:** Wants to quickly view the token balances of their own wallet or another wallet they are interested in.
*   **Developer/Recruiter:** Reviewing this project to assess technical skills in frontend, backend, and Web3 integration.

## 3. Functional Requirements (FR)

| ID  | Requirement                                                                                                  | Priority |
| :-- | :----------------------------------------------------------------------------------------------------------- | :------- |
| FR1 | **Manual Address Input:** The user must be able to enter any valid Ethereum wallet address into a text field. | Must-Have|
| FR2 | **Connect Wallet:** The user must be able to connect their own wallet (e.g., MetaMask) to automatically use their address. | Must-Have|
| FR3 | **Balance Display:** The application must fetch and display a list of ERC-20 tokens held by the address.     | Must-Have|
| FR4 | **Formatted Data:** Each token in the list must display the Token Name, Symbol, and a human-readable Balance.   | Must-Have|
| FR5 | **Loading States:** The UI must show a clear loading indicator (e.g., spinner, skeleton screen) while balances are being fetched. | Must-Have|
| FR6 | **Error Handling:** The UI must display clear, user-friendly error messages for invalid addresses, network failures, or API issues. | Must-Have|
| FR7 | **Multi-Network Support:** The user must be able to select from a predefined list of networks (e.g., Ethereum, Polygon, Arbitrum) to check balances on. | Should-Have|
| FR8 | **Token Value:** The application should display the approximate USD value of each token holding and a total portfolio value. | Should-Have|
| FR9 | **Responsive Design:** All functionality must be accessible and usable on both desktop and mobile devices.     | Could-Have |

## 4. Non-Functional Requirements (NFR)

| ID   | Requirement                                                                                                   |
| :--- | :------------------------------------------------------------------------------------------------------------ |
| NFR1 | **Performance:** Initial page load should be under 2 seconds. Balance lookups should resolve in under 5 seconds on a stable connection. |
| NFR2 | **Technology Stack:** The frontend should be built with a modern framework (e.g., React, Vue, Svelte via Next.js, Nuxt, etc.). Web3 interactions should use robust libraries (e.g., `ethers.js`, `viem`, `wagmi`).|
| NFR3 | **API and RPC Dependency:** Balance discovery and price lookups will depend on third-party APIs (e.g., Covalent, Moralis, Etherscan API). The system must be resilient to API downtime and implement multi-RPC provider failover for blockchain interactions. |
| NFR4 | **Deployment:** The final application must be deployed to a public hosting platform (e.g., Vercel, Netlify). |

## 5. RPC Provider Resilience

To ensure maximum reliability and optimal user experience, the application will implement advanced RPC provider management with the following features:

| Problem               | Wagmi's Default Behavior                                    | Your Custom Infrastructure Solution                                                                                                                                              |
| :-------------------- | :---------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rate Limiting (429 Error) | The request fails entirely, and the DApp shows an error message. | Your custom wrapper detects the 429 error, logs the provider failure, and swaps the RPC URL from Alchemy to Infura (or your private node) for all subsequent calls. |
| Silent Slowdown       | The request eventually succeeds but takes 15 seconds, tanking the UX. | Your custom logic runs parallel health checks and assigns a latency score to each provider. If Provider A's score exceeds 5 seconds, your app routes all traffic to Provider B until Provider A recovers. |
| API Key Management    | You hardcode one endpoint per environment.                  | You build a simple Load Balancing/Routing service (in Node.js) that abstracts the endpoints, letting you manage and swap keys/providers centrally without frontend redeployment. |

## 6. Out of Scope

*   This application is **read-only**. It will not perform any transactions (sending tokens, swaps, etc.).
*   Displaying NFT (ERC-721/1155) balances.
*   User accounts or data persistence (beyond what's available on the blockchain).
*   Wallet creation or management.
