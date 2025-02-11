import { ccc } from "@ckb-ccc/ccc";
import { render, signer } from "@ckb-ccc/playground";

// NOTE: Disconnect your wallet will be running this example with the default wallet with some balance of the a specific PUDT token (though you won't be able to send the transaction). If you want to use your own wallet and your own PUDT, please use the `mint.ts` example to mint some of your own PUDT tokens to your wallet first.
const executor = new ccc.ssri.ExecutorJsonRpc("http://localhost:9090");

const signerAddress = await signer.getRecommendedAddress();
const { script: signerLock } = await ccc.Address.fromString(signerAddress, signer.client);

const udtScriptCell = await signer.client.findSingletonCellByType({
  // TypeID Code Hash. Don't change
  codeHash:
    "0x00000000000000000000000000000000000000000000000000545950455f4944",
  hashType: "type",
  // TypeID args. Change it to the args of the Type ID script of your UDT
  args: "0x8fd55df879dc6176c95f3c420631f990ada2d4ece978c9512c39616dead2ed56",
});
if (!udtScriptCell) {
  throw new Error("udt script cell not found");
}

const udtCodeHash = udtScriptCell.cellOutput.type?.hash();
if (!udtCodeHash) {
  throw new Error("udt code hash not found");
}

// Note: If using the default wallet, we will instead use another predefined owner lock hash for the PUDT.

const udtOwnerLockHash = signerLock.hash() === "0x0ac59c147c592cd50958875ad50291f1c2f34025142c72526a9f5fb62f1b37b2" ? "0x02c93173368ec56f72ec023f63148461b80e7698eddd62cbd9dbe31a13f2b330" : signerLock.hash();
const signerUdtType = {
  codeHash: udtCodeHash,
  hashType: "type",
  args: udtOwnerLockHash,
};

const signerUdt = new ccc.udt.Udt(udtScriptCell.outPoint, signerUdtType, {
  executor,
});

// NOTE: Here we are using the same sender and receiver to avoid draining the sender's balance
const receiverA =
  "ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqgtlcnzzna2tqst7jw78egjpujn7hdxpackjmmdp";

const receiverB =
  "ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqgtlcnzzna2tqst7jw78egjpujn7hdxpackjmmdp";

// Parse the receiver script from an address

const { script: lockA } = await ccc.Address.fromString(
  receiverA,
  signer.client,
);
const { script: lockB } = await ccc.Address.fromString(
  receiverB,
  signer.client,
);

let signerUdtTransferTx = (
  await signerUdt.transfer(signer, [
    {
      to: lockA,
      amount: 100,
    },
    {
      to: lockB,
      amount: 200,
    },
  ])
).res;

await render(signerUdtTransferTx);

signerUdtTransferTx = await signerUdt.completeBy(signerUdtTransferTx, signer);
await signerUdtTransferTx.completeFeeBy(signer);
await render(signerUdtTransferTx);

