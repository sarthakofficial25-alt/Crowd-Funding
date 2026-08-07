export class DappError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "DappError";
  }
}

export class WalletNotConnectedError extends DappError {
  constructor() {
    super("Freighter wallet is not connected. Please connect your wallet.", "WALLET_NOT_CONNECTED");
  }
}

export class TransactionSimulationError extends DappError {
  constructor(details: string) {
    super(`Transaction simulation failed: ${details}`, "SIMULATION_FAILED");
  }
}

export class UserRejectedError extends DappError {
  constructor() {
    super("Transaction signing was rejected by user.", "USER_REJECTED");
  }
}
