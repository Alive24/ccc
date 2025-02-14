import { ccc } from "@ckb-ccc/ccc";
import { render, signer } from "@ckb-ccc/playground";

const executor = new ccc.ssri.ExecutorJsonRpc("http://localhost:9090");

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
const udtType = {
  codeHash: udtCodeHash,
  hashType: "type",
  args: "0x02c93173368ec56f72ec023f63148461b80e7698eddd62cbd9dbe31a13f2b330",
};

// Create an instance of the UDT
const udt = new ccc.udt.Udt(udtScriptCell.outPoint, udtType, { executor });
// The same script can also be instantiated as a Pausable UDT if they are compatible
const pudt = new ccc.udt.UdtPausable(udtScriptCell.outPoint, udtType, {
  executor,
});

// Interact with the UDT
const udtName = await udt.name();
const udtIcon = await udt.icon();
console.log(udtName);
// {"res":"pudt Token","cellDeps":[]}
console.log(udtIcon);
// {"res":"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQ ......

const pudtEnumeratePaused = await pudt.enumeratePaused();
console.log(pudtEnumeratePaused);
// {"res":["0xb5202efa0f2d250af66f0f571e4b8be8b272572663707a052907f8760112fe35","0xa320a09489791af2e5e1fe84927eda84f71afcbd2c7a65cb419464fe46e75085"],"cellDeps":[{"txHash":"0x98c37eabc1672c4a0a30c0bb284ed49308f0cb58b0d8791f44cca168c973e7da","index":"0"}]}

const receiverA =
  "ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsq2jk6pyw9vlnfakx7vp4t5lxg0lzvvsp3c5adflu";

const { script: lockA } = await ccc.Address.fromString(
  receiverA,
  signer.client,
);

const udtTransferTx = (
  await udt.transfer(signer, [
    {
      to: lockA,
      amount: 10000,
    },
  ])
).res;

const receiverB =
  "ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqflz4emgssc6nqj4yv3nfv2sca7g9dzhscgmg28x";
const { script: lockB } = await ccc.Address.fromString(
  receiverB,
  signer.client,
);
let combinedTransferTx = (
  await udt.transfer(
    signer,
    [
      {
        to: lockB,
        amount: 20000,
      },
    ],
    udtTransferTx,
  )
).res;
// Note: You need to connect your wallet for the following parts. You also need to have enough balance of pudt in your wallet.
combinedTransferTx = await udt.completeBy(combinedTransferTx, signer);
await combinedTransferTx.completeFeeBy(signer);
await render(combinedTransferTx);
