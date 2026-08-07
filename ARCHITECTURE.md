# 🏛️ Architecture Documentation

## System Overview

The **Stellar Crowd Funding Platform** is a decentralized crowdfunding application built on the **Stellar Blockchain** using **Soroban Smart Contracts**.

```mermaid
graph TD
    Client[Next.js 16 Client Frontend] -->|Freighter Wallet API| Wallet[Freighter Extension]
    Client -->|RPC Calls & Simulation| SorobanRPC[Stellar Soroban RPC]
    SorobanRPC -->|Invoke Transactions| CrowdFund[CrowdFunding Smart Contract]
    CrowdFund -->|Inter-Contract Call: mint()| RewardToken[RewardToken Smart Contract]
    SorobanRPC -->|Event Polling| EventFeed[Real-Time Event Stream]
```

---

## Smart Contract Architecture

### 1. `CrowdFunding` Contract
- **Storage**: `CampaignData(u32)`, `Contributions(u32)`, `CampaignCount`, `RewardToken`, `Admin`
- **Core Functions**:
  - `create_campaign(creator, title, goal, deadline)`: Initializes a campaign record and emits `campaign_created`.
  - `contribute(from, campaign_id, amount)`: Records contribution, updates progress, emits `contribution_made`, and triggers **Inter-Contract Minting** on the `RewardToken` contract (10% reward token minting).
  - `withdraw(creator, campaign_id)`: Permits campaign creator to withdraw funds upon goal attainment.
  - `cancel_campaign(creator, campaign_id)`: Allows creator to cancel active campaign.

### 2. `RewardToken` Contract (Inter-Contract Target)
- **Functions**: `initialize`, `mint`, `balance`, `name`, `symbol`, `decimals`
- **Security**: Only authorized admin (CrowdFunding contract address) can trigger `mint()`.

---

## Event Streaming & Real-Time Sync

1. Contract functions publish structured Soroban events (`campaign_created`, `contribution_made`, `reward_minted`).
2. The frontend hook `useEventStream` subscribes to/polls Soroban RPC event topics.
3. Live updates are pushed to the `EventFeed` component with zero page refresh required.

---

## CI/CD Architecture

- **GitHub Actions Workflows**:
  - `.github/workflows/ci.yml`: Runs Rust contract unit tests (`cargo test`) and Next.js Vitest suite (`npm run test`) on every PR/push.
  - `.github/workflows/deploy.yml`: Builds and deploys contract WASM to Stellar Testnet and deploys Next.js client to Vercel on `main` branch merges.
