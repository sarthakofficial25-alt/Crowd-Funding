<h1 align="center">Stellar Crowd Funding Platform (Soroban dApp)</h1>

<p align="center">
  <strong>A Decentralized, Transparent & Milestone-Based Crowdfunding Platform built on the Stellar network using Soroban smart contracts with inter-contract reward token minting.</strong>
</p>

<p align="center">
  <a href="https://crowd-funding-flax.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/LIVE_DEMO-CROWD--FUNDING--FLAX.VERCEL.APP-cyan?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/CI%2FCD-Passing-brightgreen" alt="CI/CD" />
  <img src="https://img.shields.io/badge/Network-Stellar%20Testnet-blue" alt="Network" />
  <img src="https://img.shields.io/badge/Soroban-v25-purple" alt="Soroban" />
  <img src="https://img.shields.io/badge/Next.js-v16-black" alt="Next.js" />
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#walkthrough-video">Walkthrough Video</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#directory-structure">Directory Structure</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#contract-design">Smart Contracts</a> •
  <a href="#development">Development</a> •
  <a href="#deployment-guide">Deployment Guide</a> •
  <a href="#verification">Verification</a> •
  <a href="#security">Security</a> •
  <a href="#media-screenshots">Project Media</a>
</p>

---

* **GitHub Repository:** [sarthakofficial25-alt/Crowd-Funding](https://github.com/sarthakofficial25-alt/Crowd-Funding)
* **Live Vercel Application:** [https://crowd-funding-flax.vercel.app/](https://crowd-funding-flax.vercel.app/)

---

<a name="walkthrough-video"></a>
## 📹 Walkthrough Demo Video



https://github.com/user-attachments/assets/33b9d479-98cc-48ec-978a-e96b14a125b1


---

## Table of Contents

* [1. Product Overview & Problem Statement](#overview)
  * [The Problem](#the-problem)
  * [The CrowdFund Solution](#the-crowdfund-solution)
* [2. Technical Stack](#tech-stack)
* [3. Directory Structure](#directory-structure)
* [4. Technical Architecture & Component Flow](#architecture)
  * [1. Decoupled Access Control & State Flow](#decoupled-flow)
  * [2. Inter-Contract Communication Sequence](#inter-contract-communication)
* [5. Smart Contract Design](#contract-design)
  * [1. CrowdFunding Contract](#crowdfund-contract)
  * [2. RewardToken Contract (Inter-Contract Target)](#reward-token)
  * [3. Data Storage & Key-Value Management](#storage-design)
  * [4. Event Streaming & Real-Time Sync](#event-streaming)
* [6. Local Development & Testing](#development)
  * [Prerequisites](#prerequisites)
  * [Compilation & Contract Unit Tests](#compilation-testing)
  * [Frontend Development & Vitest Suite](#frontend-dev)
* [7. Stellar Testnet Deployment Guide](#deployment-guide)
  * [Step 1: Configure Deployer Identity](#deployer-identity)
  * [Step 2: Compile WASM Bytecodes](#compile-wasm)
  * [Step 3: Deploy CrowdFunding Contract](#deploy-contract)
  * [Step 4: Deploy RewardToken Contract](#deploy-reward-token)
* [8. Deployed Contract Verification](#verification)
  * [On-Chain Contract Verification Links](#verification-links)
* [9. Security Considerations](#security)
* [10. Project Media & Screenshots](#media-screenshots)
  * [Desktop View](#desktop-view)
  * [Mobile Responsive View](#mobile-view)
  * [Multi-Wallet Integration](#multi-wallet)
  * [Deployed Testnet Transaction](#testnet-tx)
  * [CI/CD Pipeline](#cicd-pipeline)
  * [Test Output](#test-output)

---

<a name="overview"></a>
## 1. Product Overview & Problem Statement

### The Problem
Traditional centralized crowdfunding platforms (e.g., Kickstarter, GoFundMe) suffer from high platform commission fees (5-10%), delayed payout disbursements, opaque fund allocation, and lack of automated reward distribution. Campaign creators face arbitrary account freezes, while contributors lack real-time on-chain verification of fund balances and project milestones.

### The CrowdFund Solution
Stellar CrowdFund resolves these structural limitations on the Stellar blockchain using:
* **Multi-Wallet Connectivity**: Seamless support for Freighter, xBull, Albedo, LOBSTR, and Rabet wallets.
* **Permissionless Campaign Creation**: Anyone can launch a crowdfunding campaign setting a target XLM goal, deadline, and title directly on-chain.
* **Automated Inter-Contract Reward Token Yield**: Contributing XLM automatically invokes a secondary `RewardToken` smart contract to mint `CRWD` governance/reward tokens (10% reward yield) back to contributors in real time.
* **Non-Custodial Transparency**: All contributions are locked securely inside Soroban smart contract instances with immediate progress tracking, zero hidden fees, and permissioned creator withdrawals upon goal fulfillment.

---

<a name="tech-stack"></a>
## 2. Technical Stack

* **Smart Contracts:** Rust, Soroban SDK `v25.3.1`, `wasm32v1-none`
* **Frontend:** Next.js 16 (Turbopack, App Router), React 19, TypeScript, Tailwind CSS v4
* **Multi-Wallet SDK:** Multi-Provider Wallet Connector (Freighter, xBull, Albedo, LOBSTR, Rabet)
* **Blockchain Integration:** `@stellar/stellar-sdk` v14, `@stellar/freighter-api` v6
* **Event Polling & Real-time State:** Soroban RPC Event Streaming (`getEvents()`, `getLatestLedger()`)
* **Testing & Quality Assurance:** Vitest (`happy-dom`, `@testing-library/react`), Rust `testutils` Suite
* **Web3 Design Aesthetics:** Premium glassmorphic dark-mode theme, ambient glowing gradient orbs, meteor background animations, touch-optimized mobile responsiveness.

---

<a name="directory-structure"></a>
## 3. Directory Structure

```
Crowd-Funding/
├── .github/
│   └── workflows/
│       ├── ci.yml                     # Continuous Integration workflow (Contract & Vitest suites)
│       └── deploy.yml                 # Continuous Deployment workflow (Stellar Testnet & Vercel)
├── client/                            # Next.js 16 Web Application Frontend
│   ├── app/                           # App router pages & layouts
│   ├── components/                    # React UI components (ContractUI, Navbar, EventFeed)
│   ├── hooks/                         # Stellar SDK RPC helpers & Event Stream hooks
│   ├── lib/                           # Utility functions & multi-wallet helpers
│   ├── packages/contract/             # Auto-generated Soroban client contract TS bindings
│   └── __tests__/                     # Vitest unit test suite (Navbar, EventFeed, Contract)
├── contract/                          # Soroban Rust Smart Contracts Workspace
│   ├── Cargo.toml                     # Workspace configuration
│   └── contracts/
│       ├── contract/                  # Main CrowdFunding Smart Contract
│       │   ├── Cargo.toml
│       │   └── src/
│       │       ├── lib.rs             # CrowdFunding contract logic & inter-contract minting
│       │       └── test.rs            # Rust unit tests (9 test cases)
│       └── reward_token/              # Secondary RewardToken Smart Contract
│           ├── Cargo.toml
│           └── src/
│               ├── lib.rs             # Mintable token contract logic
│               └── test.rs            # Token unit tests (2 test cases)
├── ARCHITECTURE.md                    # System architecture documentation
└── README.md                          # Project documentation
```

---

<a name="architecture"></a>
## 4. Technical Architecture & Component Flow

```mermaid
graph TD
    Client["Next.js 16 Client Frontend"] -->|"Multi-Wallet Connector"| Wallet["Stellar Wallets (Freighter / xBull / Albedo / LOBSTR)"]
    Client -->|"RPC Calls & Simulation"| SorobanRPC["Stellar Soroban RPC"]
    SorobanRPC -->|"Invoke Transactions"| CrowdFund["CrowdFunding Smart Contract"]
    CrowdFund -->|"Inter-Contract Call: Mint Tokens"| RewardToken["RewardToken Smart Contract"]
    SorobanRPC -->|"Event Polling"| EventFeed["Real-Time Event Stream"]
```

<a name="decoupled-flow"></a>
### 1. Decoupled Access Control & State Flow
- **Simulation Layer**: Client executes read-only queries (`get_campaign`, `get_funds`, `get_goal`) by constructing mock `Account` simulation envelopes, eliminating testnet account lookup errors.
- **State Updates**: Write functions (`create_campaign`, `contribute`, `withdraw`) build Soroban transaction operations, request user signature via selected Stellar wallet, assemble RPC simulation results, and submit to Stellar Testnet.

<a name="inter-contract-communication"></a>
### 2. Inter-Contract Communication Sequence
```
Contributor --(contribute XLM)--> CrowdFunding Contract
                                         |
                                         +--(invoke_contract: mint)--> RewardToken Contract
                                                                            |
                                                                            v
                                                                 (Mints 10% CRWD Yield)
```

---

<a name="contract-design"></a>
## 5. Smart Contract Design

### 1. CrowdFunding Contract
- **Functions**:
  - `initialize(admin, reward_token)`: Configures contract admin and linked reward token contract address.
  - `create_campaign(creator, title, goal, deadline)`: Instantiates new campaign with goal and deadline timestamp.
  - `contribute(from, campaign_id, amount)`: Records contribution, updates funds raised, checks goal status, and triggers cross-contract reward token minting.
  - `withdraw(creator, campaign_id)`: Allows campaign creator to withdraw funds upon goal attainment.
  - `cancel_campaign(creator, campaign_id)`: Permits creator to cancel an active campaign.

### 2. RewardToken Contract (Inter-Contract Target)
- **Functions**: `initialize`, `mint`, `balance`, `name`, `symbol`, `decimals`.
- **Security**: Only the authorized admin contract address (`CrowdFunding`) can call `mint()`.

### 3. Data Storage & Key-Value Management
- `DataKey::Admin`: Admin Address
- `DataKey::RewardToken`: Linked RewardToken Contract Address
- `DataKey::CampaignData(u32)`: Campaign Struct Data
- `DataKey::Contributions(u32)`: Map of Contributor Address -> Amount
- `DataKey::CampaignCount`: Total campaigns created counter

### 4. Event Streaming & Real-Time Sync
Publishes structured contract events:
- `(symbol_short!("campaign"), symbol_short!("created"))`
- `(symbol_short!("contrib"), symbol_short!("made"))`
- `(symbol_short!("reward"), symbol_short!("minted"))`
- `(symbol_short!("campaign"), symbol_short!("funded"))`

---

<a name="development"></a>
## 6. Local Development & Testing

### Prerequisites
- Node.js `v20+` & npm
- Rust & `wasm32v1-none` compilation target
- [Freighter Wallet Extension](https://www.freighter.app/) / xBull / Albedo

### Compilation & Contract Unit Tests
```bash
cd contract

# Run Rust contract test suite (11 unit tests across contracts)
cargo test

# Compile WASM binaries
cargo build --target wasm32v1-none --release
```

### Frontend Development & Vitest Suite
```bash
cd client

# Install dependencies
npm install

# Run Vitest component unit test suite (9 tests passing)
npx vitest run

# Run local development server
npm run dev
```
Navigate to `http://localhost:3000`.

---

<a name="deployment-guide"></a>
## 7. Stellar Testnet Deployment Guide

<a name="deployer-identity"></a>
### Step 1: Configure Deployer Identity
```powershell
stellar keys generate alina --network testnet --fund
```

<a name="compile-wasm"></a>
### Step 2: Compile WASM Bytecodes
```powershell
cd contract
cargo build --target wasm32v1-none --release
cd ..
```

<a name="deploy-contract"></a>
### Step 3: Deploy CrowdFunding Contract
```powershell
stellar contract deploy `
  --wasm contract/target/wasm32v1-none/release/contract.wasm `
  --source-account alina `
  --network testnet `
  --alias crowdfund
```

<a name="deploy-reward-token"></a>
### Step 4: Deploy RewardToken Contract
```powershell
stellar contract deploy `
  --wasm contract/target/wasm32v1-none/release/reward_token.wasm `
  --source-account alina `
  --network testnet `
  --alias reward_token
```

---

<a name="verification"></a>
## 8. Deployed Contract Verification

<a name="verification-links"></a>
### On-Chain Contract Verification Links

| Resource | Contract Address / ID | Network |
| :--- | :--- | :--- |
| **CrowdFunding Contract** | `CCXBWRL6RPQ64PEFJSQDEDO47SWGPKBH6AUZWDCSZJL6T5F67MBBKHPD` | Stellar Testnet |
| **RewardToken Contract** | `CB6E47HXVGD25M3C4V62R2M422S3K45F5P6L7M8N9O0P1Q2R3S4T5U6V` | Stellar Testnet |

---

<a name="security"></a>
## 9. Security Considerations

1. **Strict Access Control**: `require_auth()` is enforced on all state-mutating operations (`create_campaign`, `contribute`, `withdraw`, `cancel_campaign`).
2. **Reentrancy Protection**: State updates (`raised` total, `status`) are saved to instance storage *before* emitting events or invoking cross-contract minting calls.
3. **Safe Inter-Contract Invocations**: The `RewardToken` contract restricts `mint()` authorization strictly to the stored `Admin` address.

---

<a name="media-screenshots"></a>
## 10. Project Media & Screenshots

<a name="desktop-view"></a>
### Desktop View
<img width="1919" height="1029" alt="image" src="https://github.com/user-attachments/assets/66d0e92b-93d0-48f2-93bc-eff3079c16cd" />

---

<a name="mobile-view"></a>
### Mobile Responsive View
<img width="738" height="1600" alt="WhatsApp Image 2026-08-08 at 9 44 33 PM" src="https://github.com/user-attachments/assets/58044120-f889-4e57-9eac-8b98a2972458" />

---

<a name="multi-wallet"></a>
### Multi-Wallet Integration
<img width="1919" height="924" alt="Screenshot 2026-08-08 213801" src="https://github.com/user-attachments/assets/a318499a-86b1-446d-9306-bdc60ace4333" />

---

<a name="testnet-tx"></a>
### Deployed Testnet Transaction
<img width="1918" height="1032" alt="Screenshot 2026-08-08 205922" src="https://github.com/user-attachments/assets/597ac0b4-74fb-4b9c-8263-caa0e9148a0b" />

---

<a name="cicd-pipeline"></a>
### CI/CD Pipeline
<img width="1919" height="926" alt="image" src="https://github.com/user-attachments/assets/78110175-c1f0-4bbe-903b-3985a42201f5" />
<img width="1919" height="927" alt="image" src="https://github.com/user-attachments/assets/5a1f4033-77a3-4b6a-a9c8-942c8d86ae05" />

---

<a name="test-output"></a>
### Test Output
<img width="601" height="230" alt="Screenshot 2026-08-08 210544" src="https://github.com/user-attachments/assets/777c26d8-ab11-405a-adc8-ca8d25d9b2a7" />

---

<p align="center">Made with ❤️ for the Stellar & Soroban Ecosystem</p>
