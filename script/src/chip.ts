import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";
import { client, gusetkeypair, keypair, signAndExecuteTransaction } from "./client";
import { counterValue } from "./verification";

export const genMintSignature = async (
	sign: string,
): Promise<Uint8Array> => {
	const msg = Buffer.concat([
		bcs.String.serialize("hero").toBytes(),
		bcs.String.serialize("mint").toBytes(),
		bcs.Address.serialize(sign).toBytes(),
		bcs.U64.serialize(await counterValue(sign)).toBytes(),
	]);
	return await gusetkeypair().sign(msg);
};

export const mintChip = async (
	user: string,
) => {
	const tx = new Transaction();
	const signature = await genMintSignature(
		keypair().toSuiAddress(),
	);
	tx.moveCall({
		package: process.env.PACKAGE_ID!,
		module: "hero",
		function: "mint",
		arguments: [
			tx.object(process.env.VERIFIER_ID!),
			tx.pure.vector("u8", signature),
		],
	});
	return await signAndExecuteTransaction(client(), keypair(), tx);
};


