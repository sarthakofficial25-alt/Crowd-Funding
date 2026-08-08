"use client";

import {
  Networks,
  TransactionBuilder,
  Keypair,
  Contract,
  xdr,
  Address,
  nativeToScVal,
  scValToNative,
  rpc,
  Account,
} from "@stellar/stellar-sdk";
import {
  isConnected,
  getAddress,
  signTransaction,
  setAllowed,
  isAllowed,
  requestAccess,
} from "@stellar/freighter-api";


// ============================================================
// CONSTANTS — Update these for your contract
// ============================================================

/** Your deployed Soroban contract ID */
export const CONTRACT_ADDRESS =
  "CCXBWRL6RPQ64PEFJSQDEDO47SWGPKBH6AUZWDCSZJL6T5F67MBBKHPD";

/** Network passphrase (testnet by default) */
export const NETWORK_PASSPHRASE = Networks.TESTNET;

/** Soroban RPC URL */
export const RPC_URL = "https://soroban-testnet.stellar.org";

/** Horizon URL */
export const HORIZON_URL = "https://horizon-testnet.stellar.org";

/** Network name for Freighter */
export const NETWORK = "TESTNET";

// ============================================================
// RPC Server Instance
// ============================================================

const server = new rpc.Server(RPC_URL);

// ============================================================
// Wallet Helpers
// ============================================================

export type WalletType = "freighter" | "xbull" | "albedo" | "lobstr" | "rabet";

export interface WalletOption {
  id: WalletType;
  name: string;
  icon: string;
  description: string;
  isAvailable: boolean;
}

export async function checkConnection(): Promise<boolean> {
  try {
    const result = await isConnected();
    return result.isConnected;
  } catch {
    return false;
  }
}

export async function connectWallet(walletType: WalletType = "freighter"): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("Window not defined");
  }

  if (walletType === "freighter") {
    const connResult = await isConnected();
    if (!connResult.isConnected) {
      throw new Error("Freighter extension is not installed. Please install Freighter from freighter.app");
    }
    const allowedResult = await isAllowed();
    if (!allowedResult.isAllowed) {
      await setAllowed();
      await requestAccess();
    }
    const { address } = await getAddress();
    if (!address) throw new Error("Could not retrieve wallet address from Freighter.");
    return address;
  }

  if (walletType === "xbull") {
    // xBull Extension injection check
    const xbull = (window as unknown as { xbull?: { getPublicKey: () => Promise<string> } }).xbull;
    if (xbull && typeof xbull.getPublicKey === "function") {
      const address = await xbull.getPublicKey();
      if (address) return address;
    }
    // Fallback redirect or prompt for xBull
    throw new Error("xBull Wallet extension is not installed or locked. Please install xBull extension or unlock it.");
  }

  if (walletType === "albedo") {
    const albedoWindow = (window as unknown as { albedo?: { publicKey: (params: object) => Promise<{ pubkey: string }> } }).albedo;
    if (albedoWindow && typeof albedoWindow.publicKey === "function") {
      const res = await albedoWindow.publicKey({});
      if (res.pubkey) return res.pubkey;
    }
    throw new Error("Albedo Wallet is not loaded or popup was closed.");
  }

  if (walletType === "lobstr" || walletType === "rabet") {
    const rabet = (window as unknown as { rabet?: { connect: () => Promise<{ publicKey: string }> } }).rabet;
    if (rabet && typeof rabet.connect === "function") {
      const res = await rabet.connect();
      if (res.publicKey) return res.publicKey;
    }
    throw new Error(`${walletType.toUpperCase()} Wallet extension not detected.`);
  }

  throw new Error("Unsupported wallet type.");
}

export async function getWalletAddress(): Promise<string | null> {
  try {
    const connResult = await isConnected();
    if (!connResult.isConnected) return null;

    const allowedResult = await isAllowed();
    if (!allowedResult.isAllowed) return null;

    const { address } = await getAddress();
    return address || null;
  } catch {
    return null;
  }
}

// ============================================================
// Contract Interaction Helpers
// ============================================================

/**
 * Build, simulate, and optionally sign + submit a Soroban contract call.
 *
 * @param method   - The contract method name to invoke
 * @param params   - Array of xdr.ScVal parameters for the method
 * @param caller   - The public key (G...) of the calling account
 * @param sign     - If true, signs via Freighter and submits. If false, only simulates.
 * @returns        The result of the simulation or submission
 */
export async function callContract(
  method: string,
  params: xdr.ScVal[] = [],
  caller: string,
  sign: boolean = true
) {
  const contract = new Contract(CONTRACT_ADDRESS);

  // For read-only (simulation-only) calls, use a mock Account to avoid
  // the "Account not found" error when the caller doesn't exist on-chain.
  let account: Account;
  if (!sign) {
    account = new Account(caller, "0");
  } else {
    account = await server.getAccount(caller);
  }

  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...params))
    .setTimeout(30)
    .build();

  const simulated = await server.simulateTransaction(tx);

  if (rpc.Api.isSimulationError(simulated)) {
    throw new Error(
      `Simulation failed: ${(simulated as rpc.Api.SimulateTransactionErrorResponse).error}`
    );
  }

  if (!sign) {
    // Read-only call — just return the simulation result
    return simulated;
  }

  // Prepare the transaction with the simulation result
  const prepared = rpc.assembleTransaction(tx, simulated).build();

  // Sign with Freighter
  const { signedTxXdr } = await signTransaction(prepared.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  const txToSubmit = TransactionBuilder.fromXDR(
    signedTxXdr,
    NETWORK_PASSPHRASE
  );

  const result = await server.sendTransaction(txToSubmit);

  if (result.status === "ERROR") {
    throw new Error(`Transaction submission failed: ${result.status}`);
  }

  // Poll for confirmation
  let getResult = await server.getTransaction(result.hash);
  while (getResult.status === "NOT_FOUND") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    getResult = await server.getTransaction(result.hash);
  }

  if (getResult.status === "FAILED") {
    throw new Error("Transaction failed on chain.");
  }

  return getResult;
}

/**
 * Read-only contract call (does not require signing).
 * Uses a random keypair as a dummy source account — the mock Account
 * in callContract avoids hitting the network for account lookup.
 */
export async function readContract(
  method: string,
  params: xdr.ScVal[] = [],
  caller?: string
) {
  const account =
    caller || Keypair.random().publicKey(); // Use a random keypair for read-only
  const sim = await callContract(method, params, account, false);
  if (
    rpc.Api.isSimulationSuccess(sim as rpc.Api.SimulateTransactionResponse) &&
    (sim as rpc.Api.SimulateTransactionSuccessResponse).result
  ) {
    return scValToNative(
      (sim as rpc.Api.SimulateTransactionSuccessResponse).result!.retval
    );
  }
  return null;
}

// ============================================================
// ScVal Conversion Helpers
// ============================================================

export function toScValString(value: string): xdr.ScVal {
  return nativeToScVal(value, { type: "string" });
}

export function toScValU32(value: number): xdr.ScVal {
  return nativeToScVal(value, { type: "u32" });
}

export function toScValI128(value: bigint): xdr.ScVal {
  return nativeToScVal(value, { type: "i128" });
}

export function toScValAddress(address: string): xdr.ScVal {
  return new Address(address).toScVal();
}

export function toScValBool(value: boolean): xdr.ScVal {
  return nativeToScVal(value, { type: "bool" });
}

// ============================================================
// Crowd Funding — Contract Methods
// (Matches the DEPLOYED contract on testnet, per the generated bindings)
// ============================================================

/**
 * Create a new campaign.
 * Deployed contract signature: create_campaign(creator: Address, goal: i128)
 */
export async function createCampaign(
  caller: string,
  goal: bigint
) {
  return callContract(
    "create_campaign",
    [toScValAddress(caller), toScValI128(goal)],
    caller,
    true
  );
}

/**
 * Contribute to a campaign.
 * Deployed contract signature: contribute(from: Address, creator: Address, amount: i128)
 */
export async function contribute(
  caller: string,
  creator: string,
  amount: bigint
) {
  return callContract(
    "contribute",
    [toScValAddress(caller), toScValAddress(creator), toScValI128(amount)],
    caller,
    true
  );
}

/**
 * Get total funds for a campaign (read-only).
 * Deployed contract signature: get_funds(creator: Address) -> i128
 */
export async function getFunds(
  creator: string,
  caller?: string
): Promise<bigint> {
  const result = await readContract(
    "get_funds",
    [toScValAddress(creator)],
    caller
  );
  return result as bigint;
}

/**
 * Get goal for a campaign (read-only).
 * Deployed contract signature: get_goal(creator: Address) -> i128
 */
export async function getGoal(
  creator: string,
  caller?: string
): Promise<bigint> {
  const result = await readContract(
    "get_goal",
    [toScValAddress(creator)],
    caller
  );
  return result as bigint;
}

export { nativeToScVal, scValToNative, Address, xdr };
