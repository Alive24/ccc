import { ccc } from "@ckb-ccc/core";
import { ProviderDetail as EIP6963ProviderDetail } from "./eip6963.advanced";

export class Signer extends ccc.Signer {
  constructor(
    client: ccc.Client,
    public readonly detail: EIP6963ProviderDetail,
  ) {
    super(client);
  }

  async getEVMAccount() {
    return (await this.detail.provider.request({ method: "eth_accounts" }))[0];
  }

  async getInternalAddress(): Promise<string> {
    return this.getEVMAccount();
  }

  async getAddressObjs(): Promise<ccc.Address[]> {
    const account = await this.getEVMAccount();
    return [
      await ccc.Address.fromKnownScript(
        ccc.KnownScript.OmniLock,
        ccc.hexFrom([0x12, ...ccc.bytesFrom(account), 0x00]),
        this.client,
      ),
    ];
  }

  async connect(): Promise<void> {
    await this.detail.provider.request({ method: "eth_requestAccounts" });
  }

  async signMessage(message: string | ccc.BytesLike): Promise<ccc.Hex> {
    const challenge =
      typeof message === "string" ? ccc.bytesFrom(message, "utf8") : message;
    const address = await this.getEVMAccount();

    return this.detail.provider.request({
      method: "personal_sign",
      params: [ccc.hexFrom(challenge), address],
    });
  }

  async signOnlyTransaction(tx: ccc.Transaction): Promise<ccc.Transaction> {
    const { script } = await this.getRecommendedAddressObj();
    const info = await ccc.getSignHashInfo(tx, script);
    if (!info) {
      return tx;
    }

    const signature = ccc.bytesFrom(
      await this.signMessage(`CKB transaction: ${info.message}`),
    );
    if (signature[signature.length - 1] >= 27) {
      signature[signature.length - 1] -= 27;
    }

    const witness = ccc.WitnessArgs.fromBytes(tx.witnesses[info.position]);
    witness.lock = ccc.hexFrom(
      ccc.bytesConcat(
        ccc.numToBytes(5 * 4 + signature.length, 4),
        ccc.numToBytes(4 * 4, 4),
        ccc.numToBytes(5 * 4 + signature.length, 4),
        ccc.numToBytes(5 * 4 + signature.length, 4),
        ccc.numToBytes(signature.length, 4),
        signature,
      ),
    );

    tx.witnesses[info.position] = ccc.hexFrom(witness.toBytes());

    return tx;
  }
}
