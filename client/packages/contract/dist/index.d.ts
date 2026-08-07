import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions } from "@stellar/stellar-sdk/contract";
import type { i128 } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
export declare const networks: {
    readonly testnet: {
        readonly networkPassphrase: "Test SDF Network ; September 2015";
        readonly contractId: "CCXBWRL6RPQ64PEFJSQDEDO47SWGPKBH6AUZWDCSZJL6T5F67MBBKHPD";
    };
};
export type DataKey = {
    tag: "Campaigns";
    values: void;
} | {
    tag: "Funds";
    values: void;
};
export interface Client {
    get_goal: ({ creator }: {
        creator: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<i128>>;
    get_funds: ({ creator }: {
        creator: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<i128>>;
    contribute: ({ from, creator, amount }: {
        from: string;
        creator: string;
        amount: i128;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    create_campaign: ({ creator, goal }: {
        creator: string;
        goal: i128;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
}
export declare class Client extends ContractClient {
    readonly options: ContractClientOptions;
    static deploy<T = Client>(options: MethodOptions & Omit<ContractClientOptions, "contractId"> & {
        wasmHash: Buffer | string;
        salt?: Buffer | Uint8Array;
        format?: "hex" | "base64";
    }): Promise<AssembledTransaction<T>>;
    constructor(options: ContractClientOptions);
    readonly fromJSON: {
        get_goal: (json: string) => AssembledTransaction<bigint>;
        get_funds: (json: string) => AssembledTransaction<bigint>;
        contribute: (json: string) => AssembledTransaction<null>;
        create_campaign: (json: string) => AssembledTransaction<null>;
    };
}
