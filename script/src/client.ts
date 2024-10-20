import type {
	SuiExecutionResult,
	SuiTransactionBlockResponse,
} from "@mysten/sui/client";
import { SuiClient } from "@mysten/sui/client";
import { Secp256k1Keypair } from "@mysten/sui/keypairs/secp256k1";
import type { Transaction } from "@mysten/sui/transactions";

export type Network = "mainnet" | "testnet" | "devnet" | "local";

const networkUrls: { [key in Network]: string } = {
	mainnet: "https://fullnode.mainnet.sui.io:443",
	testnet: "https://fullnode.testnet.sui.io:443",
	devnet: "https://fullnode.devnet.sui.io:443",
	local: "http://127.0.0.1:9000",
};

export const client = (
	network: Network = process.env.ENV as Network||'testnet',
): SuiClient => {
	const url = networkUrls[network];

	if (!url) {
		throw new Error("Invalid network");
	}
	return new SuiClient({ url });
};

export const keypair = (
	secretPhrase: string = process.env.DEMON_HUNTER!,
): Secp256k1Keypair => {
	console.log(secretPhrase);
	return Secp256k1Keypair.deriveKeypair(secretPhrase);
};


export const gusetkeypair = (
	secretPhrase: string = process.env.GUST_PHRASE!,
): Secp256k1Keypair => {
	console.log(secretPhrase);
	return Secp256k1Keypair.deriveKeypair(secretPhrase);
}
export const pubKey = async () => {
	return keypair().getPublicKey().toRawBytes();
};
export const guestPubKey = async () => {
	return gusetkeypair().getPublicKey().toRawBytes();
}
export const signAndExecuteTransaction = async (
	client: SuiClient,
	signer: Secp256k1Keypair,
	transaction: Transaction,
	options = {},
): Promise<SuiTransactionBlockResponse> => {
	const resp = await client.signAndExecuteTransaction({
		signer,
		transaction,
		options,
	});
	const res = await client.waitForTransaction({ digest: resp.digest });
	console.log(res);
	return resp;
};

export const devInspectTransactionBlock = async (
	client: SuiClient,
	signer: Secp256k1Keypair,
	transaction: Transaction,
): Promise<SuiExecutionResult[]> => {
	const resp = await client.devInspectTransactionBlock({
		sender: signer.toSuiAddress(),
		transactionBlock: transaction,
	});
	if (resp.error) {
		throw Error(`response error: ${JSON.stringify(resp, null, 2)}`);
	}
	if (!resp.results?.length) {
		throw Error(`response has no results: ${JSON.stringify(resp, null, 2)}`);
	}
	return resp.results;
};

export const extractValue = (result: SuiExecutionResult): Uint8Array => {
	// @ts-ignore
	const value = result.returnValues[0];
	return Uint8Array.from(value[0]);
};
