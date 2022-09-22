import { State } from "../types";

export type Bip44Path = {
  account: number;
  change: number;
  index: number;
};

export type MnemonicState = {
  id: string;
  description?: string;
  phrase: Uint8Array;
};

export type DerivedAccount = {
  bip44Path: Bip44Path;
  address: string;
  establishedAddress: string;
};

export type AccountState = DerivedAccount & {
  id: string;
  parentId: string;
  description?: string;
  private: Uint8Array;
  public: Uint8Array;
};

export enum KeyRingStatus {
  NOTLOADED,
  EMPTY,
  LOCKED,
  UNLOCKED,
}

export interface IKeyRingState {
  status: KeyRingStatus;
  password?: string;
  mnemonics: MnemonicState[];
  accounts: AccountState[];
}

export class KeyRingState extends State<IKeyRingState> {
  constructor(initialState: IKeyRingState) {
    super(initialState);
  }

  public get password(): string | undefined {
    return this.state.password;
  }

  public get status(): KeyRingStatus {
    return this.state.status;
  }

  public get accounts(): AccountState[] {
    return this.state.accounts;
  }

  public get mnemonics(): MnemonicState[] {
    return this.state.mnemonics;
  }
}
