import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CCXBWRL6RPQ64PEFJSQDEDO47SWGPKBH6AUZWDCSZJL6T5F67MBBKHPD",
  }
} as const

export type DataKey = {tag: "Campaigns", values: void} | {tag: "Funds", values: void};

export interface Client {
  /**
   * Construct and simulate a get_goal transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_goal: ({creator}: {creator: string}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a get_funds transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_funds: ({creator}: {creator: string}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a contribute transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  contribute: ({from, creator, amount}: {from: string, creator: string, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a create_campaign transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_campaign: ({creator, goal}: {creator: string, goal: i128}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
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