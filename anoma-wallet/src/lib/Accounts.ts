import { toHex } from "@cosmjs/encoding";
import { Tokens, TokenType } from "constants/";
import AnomaClient from "./AnomaClient";

type ChildAccount = {
  xpriv: string;
};

type AccountType = {
  [type: number]: ChildAccount[];
};

class Accounts {
  private _mnemonic: string;
  private _client: AnomaClient | undefined;
  private _accounts: AccountType = {};

  constructor(mnemonic: string) {
    this._mnemonic = mnemonic;
  }

  public async init(): Promise<Accounts> {
    this._client = await new AnomaClient().init();
    return this;
  }

  public new(token: TokenType): ChildAccount {
    const { type } = Tokens[token];
    if (!this._accounts[type]) {
      this._accounts[type] = [];
    }

    const index = this._accounts[type].length;
    const childAccount = this._client?.account.derive(
      this._mnemonic,
      "",
      Accounts.makePath(type, 0, 0, index),
      `${index}`
    );

    const child = {
      xpriv: toHex(new Uint8Array(childAccount.xpriv.secret)),
    };

    this._accounts[type].push(child);

    return child;
  }

  public static makePath(
    type: number,
    account: number,
    change: number,
    index: number
  ): string {
    return `m/44'/${type}'/${account}'/${change}/${index}`;
  }
}

export default Accounts;
