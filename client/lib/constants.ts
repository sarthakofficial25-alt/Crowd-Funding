import { Networks } from "@stellar/stellar-sdk";

export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "CDKKRIDJ4Q2DGJKQXBRBF22BZFRLMEEK722LGDQBBOGRPF4IUS65KSHJ";

export const REWARD_TOKEN_ADDRESS =
  process.env.NEXT_PUBLIC_REWARD_TOKEN_ADDRESS ||
  "CB6E47HXVGD25M3C4V62R2M422S3K45F5P6L7M8N9O0P1Q2R3S4T5U6V";

export const NETWORK_PASSPHRASE = Networks.TESTNET;
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://soroban-testnet.stellar.org";
export const HORIZON_URL = process.env.NEXT_PUBLIC_HORIZON_URL || "https://horizon-testnet.stellar.org";
export const NETWORK = "TESTNET";
