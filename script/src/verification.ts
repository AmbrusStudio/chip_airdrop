import {client, devInspectTransactionBlock, extractValue, keypair, signAndExecuteTransaction} from "./client";
import {Transaction} from "@mysten/sui/transactions";
import {bcs} from "@mysten/sui/bcs";

export const counterValue = async (address: string) => {
    const tx = new Transaction();
    tx.moveCall({
        package: process.env.PACKAGE_ID!,
        module: "verification",
        function: "counter_value",
        arguments: [tx.object(process.env.VERIFIER_ID!), tx.pure.address(address)]
    });
    const resp = await devInspectTransactionBlock(client(), keypair(), tx);
    console.log(bcs.u64().parse(extractValue(resp[0])));
    return bcs.u64().parse(extractValue(resp[0]));
}

export const overwritePubKey = async (pubKey: Uint8Array) => {
    const tx = new Transaction();
    console.log("verify pubkey",pubKey);
    tx.moveCall({
        package: process.env.PACKAGE_ID!,
        module: "verification",
        function: "overwrite_pub_key",
        arguments: [
            tx.object(process.env.VERIFIER_CAP_ID!),
            tx.object(process.env.VERIFIER_ID!),
            tx.pure.vector("u8", pubKey),
        ],
    });
    return await signAndExecuteTransaction(client(), keypair(), tx);
}

export const getVerifyPubKey = async () => {

    const tx = new Transaction();
    tx.moveCall({
        package: process.env.PACKAGE_ID!,
        module: "verification",
        function: "pub_key",
        arguments: [
            tx.object(process.env.VERIFIER_ID!)
        ],
    });
 const clientReq  =await client();

 const object =await clientReq.getObject({
       id: process.env.VERIFIER_ID!,
    })
    console.log(JSON.stringify(object));

}