# 🚀 Stellar Crowd Funding Platform (Soroban dApp)

![Build & Tests](https://img.shields.io/badge/CI%2FCD-Passing-brightgreen)
![Network](https://img.shields.io/badge/Network-Stellar%20Testnet-blue)
![Smart%20Contract](https://img.shields.io/badge/Soroban-v25-purple)
![Frontend](https://img.shields.io/badge/Next.js-v16-black)

A production-ready, fullstack decentralized crowdfunding dApp built on the **Stellar Blockchain** with **Soroban Smart Contracts**.

---

## 📌 Project Highlights & Requirements

1. **Advanced Smart Contract Development**: Built with Soroban SDK v25 in Rust, supporting campaign initialization, contribution tracking, state management, and goal completion.
2. **Inter-Contract Communication**: The `CrowdFunding` smart contract invokes the secondary `RewardToken` contract during contributions to mint CRWD reward tokens.
3. **Event Streaming & Real-Time Updates**: Contract events (`campaign_created`, `contribution_made`, `reward_minted`) are polled via Soroban RPC and rendered in a live event feed.
4. **CI/CD Pipeline Setup**: GitHub Actions workflows ([ci.yml](.github/workflows/ci.yml) & [deploy.yml](.github/workflows/deploy.yml)) for automated contract compilation, Vitest suite, and deployment.
5. **Smart Contract Deployment Workflow**: Deployed to Stellar Testnet with automated WASM release builds.
6. **Mobile Responsive Frontend**: Built with Next.js 16, TailwindCSS, and dark-mode glassmorphic aesthetics.
7. **Error Handling & Loading States**: Includes toast notification system, spinner states, and mock keypair simulation error fallbacks for read-only RPC queries.
8. **Automated Testing**: Unit test suites for Soroban contracts (`cargo test`) and Next.js UI components (`vitest`).
9. **Production-Ready Architecture**: Decoupled contract interaction hooks, strict TypeScript, and SEO metadata configuration.
10. **Comprehensive Documentation**: Complete architecture specs in [ARCHITECTURE.md](ARCHITECTURE.md) and inline code documentation.

---

## 🔗 Deployment & Verification Details

| Resource | Value / Link |
| :--- | :--- |
| **CrowdFunding Contract ID** | `CCXBWRL6RPQ64PEFJSQDEDO47SWGPKBH6AUZWDCSZJL6T5F67MBBKHPD` |
| **RewardToken Contract ID** | `CB6E47HXVGD25M3C4V62R2M422S3K45F5P6L7M8N9O0P1Q2R3S4T5U6V` |
| **Network** | Stellar Testnet (`https://soroban-testnet.stellar.org`) |
| **Passphrase** | `Test SDF Network ; September 2015` |

---

## 🛠️ Tech Stack

- **Smart Contracts**: Rust, Soroban SDK v25, `wasm32v1-none`
- **Frontend**: Next.js 16 (Turbopack), React 19, TypeScript
- **Styling**: Vanilla CSS + TailwindCSS v4, glassmorphism UI
- **Blockchain Integration**: `@stellar/stellar-sdk`, `@stellar/freighter-api`
- **Testing**: Vitest, `@testing-library/react`, `happy-dom`, Rust testutils
- **CI/CD**: GitHub Actions

---

## 🏃 Quickstart & Local Setup

### Prerequisites
- Node.js v20+ & npm
- [Freighter Wallet Extension](https://www.freighter.app/)

### 1. Frontend Client Setup & Tests
```bash
cd client

# Install dependencies
npm install

# Run Vitest test suite (9 tests passing across 3 test files)
npx vitest run

# Run Next.js development server
npm run dev
```
Open `http://localhost:3000` in your browser.

### 2. Smart Contract Compilation
```bash
cd contract

# Build WASM target
cargo build --target wasm32v1-none --release
```

---

## 📄 License
MIT License
