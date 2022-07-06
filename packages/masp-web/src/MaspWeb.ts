import init, {
  create_shielded_transfer,
  get_shielded_balance,
  NodeWithNextId as NodeWithNextIdWasmType,
  ShieldedAccount,
  ShieldedAccountType,
  create_master_shielded_account,
  create_derived_shielded_account,
} from "./utils/masp-web";
export type { ShieldedAccountType };
// fetches a file from create react app public/assets/ folder to byte array
const fetchFromPublicFolderToByteArray = async (
  fileName: string
): Promise<Uint8Array | undefined> => {
  const response = await fetch(`${process.env.PUBLIC_URL}/assets/${fileName}`);
  const data = await (await response?.blob()).arrayBuffer();
  const dataAsByteArray = new Uint8Array(data);
  return Promise.resolve(dataAsByteArray);
};

type NodeWithNextId = {
  node: Uint8Array;
  nextTransactionId: string;
};

type NodeWithNextIdWasm = {
  node: Uint8Array;
  next_transaction_id: string;
};

export type { NodeWithNextId };

let initialisedMaspWeb: MaspWeb | undefined;

// this is a util to give the initiated MaspWeb, best to put all func calls under
// in this class and not static to ensure this is initiated correctly
export const getMaspWeb = async (): Promise<MaspWeb> => {
  if (typeof initialisedMaspWeb === "undefined") {
    initialisedMaspWeb = await new MaspWeb().init();
    return initialisedMaspWeb;
  }
  return initialisedMaspWeb;
};

export class MaspWeb {
  public memory: WebAssembly.Memory | null = null;

  spendingKey?: string;
  paymentAddress?: string;

  static init = async (): Promise<MaspWeb> => {
    await init();
    return new MaspWeb();
  };

  public async init(): Promise<MaspWeb> {
    // Support setting wasm-pack target to "nodejs" (for testing)
    const _init =
      typeof init === "function"
        ? init
        : () => Promise.resolve({ memory: null });

    const { memory } = await _init();
    this.memory = memory;
    return this;
  }

  generateShieldedTransaction = async (
    nodesWithNextId: NodeWithNextId[],
    amount: bigint,
    inputAddress: string | undefined,
    outputAddress: string,
    tokenAddress: string
  ): Promise<Uint8Array> => {
    const nodesWithNextIdWasm: NodeWithNextIdWasm[] = nodesWithNextId.map(
      (nodeWithNextId) => {
        return {
          node: nodeWithNextId.node,
          next_transaction_id: nodeWithNextId.nextTransactionId,
        };
      }
    );

    const spendParamBytesAsByteArray = await fetchFromPublicFolderToByteArray(
      "masp-spend.params"
    );

    const outputParamBytesAsByteArray = await fetchFromPublicFolderToByteArray(
      "masp-output.params"
    );
    if (spendParamBytesAsByteArray && outputParamBytesAsByteArray) {
      const shieldedTransfer = create_shielded_transfer(
        nodesWithNextIdWasm,
        inputAddress,
        outputAddress,
        tokenAddress,
        amount,
        spendParamBytesAsByteArray,
        outputParamBytesAsByteArray
      );
      if (shieldedTransfer) {
        return Promise.resolve(shieldedTransfer);
      }
      return Promise.resolve(new Uint8Array([-2]));
    } else {
      return Promise.resolve(new Uint8Array());
    }
  };

  /**
   *
   * @param nodesWithNextId - these are the fetched transactions
   * @param inputAddress - This is the viewing key/spending key that the balance is being checked for
   * @returns
   */
  getShieldedBalance = async (
    nodesWithNextId: NodeWithNextId[],
    inputAddress: string,
    tokenAddress: string
  ): Promise<string> => {
    const nodesWithNextIdWasm: NodeWithNextIdWasm[] = nodesWithNextId.map(
      (nodeWithNextId) => {
        return {
          node: nodeWithNextId.node,
          next_transaction_id: nodeWithNextId.nextTransactionId,
        };
      }
    );

    const shieldedBalanceInMicros = get_shielded_balance(
      nodesWithNextIdWasm,
      inputAddress,
      tokenAddress
    );
    if (shieldedBalanceInMicros !== undefined) {
      const shieldedBalance = Number(shieldedBalanceInMicros) / 1_000_000;
      const shieldedBalanceAsString = shieldedBalance.toString();
      return Promise.resolve(shieldedBalanceAsString);
    }
    return Promise.reject("could not fetch shielded balance");
  };

  decodeTransactionWithNextTxId = (byteArray: Uint8Array): NodeWithNextId => {
    const nodeWithNextIdWasm: NodeWithNextIdWasm =
      NodeWithNextIdWasmType.decode_transaction_with_next_tx_id(byteArray);
    const nodeWithNextId: NodeWithNextId = {
      node: nodeWithNextIdWasm.node,
      nextTransactionId: nodeWithNextIdWasm.next_transaction_id,
    };
    return nodeWithNextId;
  };

  createShieldedMasterAccount = (
    alias: string,
    seedPhrase: string,
    password?: string
  ) => {
    const passwordOrDefault = password || "no_password_provided";
    const shieldedAccount = create_master_shielded_account(
      alias,
      seedPhrase,
      passwordOrDefault
    );
    return shieldedAccount;
  };

  createShieldedDerivedAccount = (
    alias: string,
    path: string,
    password?: string
  ) => {
    const shieldedAccount = create_derived_shielded_account(
      alias,
      path,
      password
    );
    return shieldedAccount;
  };
}

export class MaspShieldedAccount {
  // using this instead of keyword'ed constructor as we want this to be async
  // for being able to kickstart the wasm stuff with the call to init()
  static init = async (): Promise<ShieldedAccount> => {
    await init();
    return new ShieldedAccount();
  };
}
