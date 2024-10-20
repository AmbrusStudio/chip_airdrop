import path from "node:path";
import { Command } from "commander";
import { config } from "dotenv";
import { keypair, pubKey, gusetkeypair, guestPubKey } from "./client";

import {
	mintChip
} from "./chip";
import { counterValue, overwritePubKey, getVerifyPubKey } from "./verification";
console.log("ENV", process.env.ENV);

config({
	path: path.resolve(`.env.${process.env.ENV||'testnet'}`),
});

console.log("ENV network", process.env.SUI_NETWORK);
const utils = (program: Command) => {
	const utils = program.command("utils").description("Utility commands");
	utils
		.command("pub-key")
		.description("Display the set public key")
		.action(async () => {
			console.log(Buffer.from(await pubKey()).toString("hex"));
		});
};


const chip = (program: Command) => {
	const chip = program.command("chip").description("chip commands");
	chip
		.command("mint")
		.option("-u, --user <user>", "The user address", gusetkeypair().toSuiAddress())
		.description("Mint a single skin")
		.action(async (options) => {
			await mintChip(
				options.user,
			);
		});


};

const verification = (program: Command) => {
	const verification = program
		.command("verification")
		.description("Verification commands");
	verification
		.command("counter-value")
		.option(
			"-a, --address <address>",
			"The address to check",
			keypair().toSuiAddress(),
		)
		.description("Check the counter value")
		.action(async (options) => {
			await counterValue(options.address);
		});

	verification
		.command("overwrite-pub-key")
		.option(
			"-p, --pub-key <pub-key>",
			"The new public key",
			Buffer.from(keypair().getPublicKey().toRawBytes()).toString("hex"),
		)
		.description("Overwrite the public key")
		.action(async (options) => {

			console.log(options.pubKey)
			await overwritePubKey(Buffer.from(options.pubKey, "hex"));
		});


		verification
		.command("get-pub-key")
		.description("Overwrite the public key")
		.action(async (options) => {
			await getVerifyPubKey();
		});
};

async function main() {
	const program = new Command();

	program
		.name(`fs-${process.env.ENV}`)
		.description("Example program with argument descriptions")
		.version("0.0.1");
	utils(program);
	chip(program);
	verification(program);
	await program.parseAsync(process.argv);
}

main().catch((err) => {
	console.error("Error executing program:", err);
	process.exit(1);
});
