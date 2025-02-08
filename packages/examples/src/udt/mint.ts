import { ccc } from "@ckb-ccc/ccc";
import { render, signer } from "@ckb-ccc/playground";

const executor = new ccc.ssri.ExecutorJsonRpc("http://localhost:9090");

const signerAddress = await signer.getRecommendedAddress();
const {script: signerLock} = await ccc.Address.fromString(signerAddress, signer.client);

const pudtScriptCell = await signer.client.findSingletonCellByType({
  // TypeID Code Hash. Don't change
  codeHash:
    "0x00000000000000000000000000000000000000000000000000545950455f4944",
  hashType: "type",
  // TypeID args. Change it to the args of the Type ID script of your UDT
  args: "0x8fd55df879dc6176c95f3c420631f990ada2d4ece978c9512c39616dead2ed56",
});
if (!pudtScriptCell) {
  throw new Error("PUDT script cell not found");
}

const pudtCodeHash = pudtScriptCell.cellOutput.type?.hash();
if (!pudtCodeHash) {
  throw new Error("PUDT code hash not found");
}
const signerPudtType = {
  codeHash: pudtCodeHash,
  hashType: "type",
  args: signerLock.hash()
};

const signerPudt = new ccc.udt.Udt(pudtScriptCell.outPoint, signerPudtType, {
  executor,
});

const receiverA =
  "ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsq2jk6pyw9vlnfakx7vp4t5lxg0lzvvsp3c5adflu";

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

const signerPudtMintTx = (
  await signerPudt.mint(signer, [
    {
      to: lockA,
      amount: 1000000000000000000,
    },
    {
      to: lockB,
      amount: 2000000000000000000,
    },
  ])
).res;

await signerPudtMintTx.completeFeeBy(signer);
await render(signerPudtMintTx);

const signerPudtMintTxHash = await signer.sendTransaction(signerPudtMintTx);

console.log(signerPudtMintTxHash);
