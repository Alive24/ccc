import { ccc } from "@ckb-ccc/core";
import { Provider } from "./uni-sat.advanced";

export class Signer extends ccc.SignerBTC {
  constructor(
    client: ccc.Client,
    public readonly provider: Provider,
  ) {
    super(client);
  }

  async getBTCAccount() {
    return (await this.provider.getAccounts())[0];
  }

  async getBTCPublicKey(): Promise<ccc.Hex> {
    return ccc.hexFrom(await this.provider.getPublicKey());
  }

  async connect(): Promise<void> {
    await this.provider.requestAccounts();
  }

  async signMessage(message: string | ccc.BytesLike): Promise<string> {
    const challenge =
      typeof message === "string" ? message : ccc.hexFrom(message).slice(2);

    return this.provider.signMessage(challenge, "ecdsa");
  }
}
