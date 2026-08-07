import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from "@stellar/stellar-sdk/contract";
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
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAgAAAAAAAAAAAAAACUNhbXBhaWducwAAAAAAAAAAAAAAAAAABUZ1bmRzAAAA",
            "AAAAAAAAAAAAAAAIZ2V0X2dvYWwAAAABAAAAAAAAAAdjcmVhdG9yAAAAABMAAAABAAAACw==",
            "AAAAAAAAAAAAAAAJZ2V0X2Z1bmRzAAAAAAAAAQAAAAAAAAAHY3JlYXRvcgAAAAATAAAAAQAAAAs=",
            "AAAAAAAAAAAAAAAKY29udHJpYnV0ZQAAAAAAAwAAAAAAAAAEZnJvbQAAABMAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAA==",
            "AAAAAAAAAAAAAAAPY3JlYXRlX2NhbXBhaWduAAAAAAIAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAAAAAAEZ29hbAAAAAsAAAAA"]), options);
        this.options = options;
    }
    fromJSON = {
        get_goal: (this.txFromJSON),
        get_funds: (this.txFromJSON),
        contribute: (this.txFromJSON),
        create_campaign: (this.txFromJSON)
    };
}
