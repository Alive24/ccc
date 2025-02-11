import { ccc } from "@ckb-ccc/ccc";
import { signer } from "@ckb-ccc/playground";

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

const udt = new ccc.udt.Udt(udtScriptCell.outPoint, udtType, {
  executor,
});

const udtSymbol = await udt.symbol();

console.log(udtSymbol);
///
// {"res":"PUDT","cellDeps":[]}
///
