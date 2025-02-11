import { ccc } from "@ckb-ccc/ccc";
import { render, signer } from "@ckb-ccc/playground";

const executor = new ccc.ssri.ExecutorJsonRpc("http://localhost:9090");

const signerAddress = await signer.getRecommendedAddress();
const {script: signerLock} = await ccc.Address.fromString(signerAddress, signer.client);

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
const signerUdtType = {
  codeHash: udtCodeHash,
  hashType: "type",
  args: signerLock.hash()
};

const signerUdt = new ccc.udt.Udt(udtScriptCell.outPoint, signerUdtType, {
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

const signerUdtMintTx = (
  await signerUdt.mint(signer, [
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

await signerUdtMintTx.completeFeeBy(signer);
await render(signerUdtMintTx);