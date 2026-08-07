import { Buffer } from "buffer";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type { i128 } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  (window as unknown as { Buffer: typeof Buffer }).Buffer = (window as unknown as { Buffer: typeof Buffer }).Buffer || Buffer;
}

export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CCXBWRL6RPQ64PEFJSQDEDO47SWGPKBH6AUZWDCSZJL6T5F67MBBKHPD",
  }
} as const

export type DataKey = {tag: "Campaigns", values: void} | {tag: "Funds", values: void};

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface Client {
  get_goal: ({creator}: {creator: string}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>
  get_funds: ({creator}: {creator: string}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>
  contribute: ({from, creator, amount}: {from: string, creator: string, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<null>>
  create_campaign: ({creator, goal}: {creator: string, goal: i128}, options?: MethodOptions) => Promise<AssembledTransaction<null>>
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class Client extends ContractClient {
  static async deploy<T = Client>(
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        wasmHash: Buffer | string;
        salt?: Buffer | Uint8Array;
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAgAAAAAAAAAAAAAACUNhbXBhaWducwAAAAAAAAAAAAAAAAAABUZ1bmRzAAAA",
        "AAAAAAAAAAAAAAAIZ2V0X2dvYWwAAAABAAAAAAAAAAdjcmVhdG9yAAAAABMAAAABAAAACw==",
        "AAAAAAAAAAAAAAAJZ2V0X2Z1bmRzAAAAAAAAAQAAAAAAAAAHY3JlYXRvcgAAAAATAAAAAQAAAAs=",
        "AAAAAAAAAAAAAAAKY29udHJpYnV0ZQAAAAAAAwAAAAAAAAAEZnJvbQAAABMAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAA==",
        "AAAAAAAAAAAAAAAPY3JlYXRlX2NhbXBhaWduAAAAAAIAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAAAAAAEZ29hbAAAAAsAAAAA" ]),
      options
    )
  }
  public readonly fromJSON = {
    get_goal: this.txFromJSON<i128>,
    get_funds: this.txFromJSON<i128>,
    contribute: this.txFromJSON<null>,
    create_campaign: this.txFromJSON<null>
  }
}