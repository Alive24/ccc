import { ccc } from "@ckb-ccc/ccc";
import { signer } from "@ckb-ccc/playground";

const executor = new ccc.ssri.ExecutorJsonRpc("http://localhost:9090");

const scriptCell = await signer.client.findSingletonCellByType({
  // TypeID Code Hash. Don't change
  codeHash:
    "0x00000000000000000000000000000000000000000000000000545950455f4944",
  hashType: "type",
  // TypeID args. Change it to the args of the Type ID script of your Script
  args: "0x8fd55df879dc6176c95f3c420631f990ada2d4ece978c9512c39616dead2ed56",
});
if (!scriptCell) {
  throw new Error("Script cell not found");
}

const scriptCodeHash = scriptCell.cellOutput.type?.hash();
if (!scriptCodeHash) {
  throw new Error("Script code hash not found");
}

const script = new ccc.ssri.Trait(scriptCell.outPoint, executor);

const scriptVersion = await script.version();

console.log(scriptVersion);
///
// {"res":"0","cellDeps":[]}
///
