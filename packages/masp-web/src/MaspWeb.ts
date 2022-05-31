import init, {
  create_shielded_transfer,
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

export class MaspWeb {
  spendingKey?: string;
  paymentAddress?: string;

  static init = async (): Promise<MaspWeb> => {
    await init();
    return new MaspWeb();
  };

  generateShieldedTransaction = async (
    nodesWithNextId: NodeWithNextId[],
    amount: BigInt,
    inputAddress: string,
    outputAddress: string
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

    const tokenAddress =
      "atest1v4ehgw36x3prswzxggunzv6pxqmnvdj9xvcyzvpsggeyvs3cg9qnywf589qnwvfsg5erg3fkl09rg5";

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

  createTransaction = () => {
    console.log("MaspWeb.createTransaction");
  };

  static decodeTransactionWithNextTxId = (
    byteArray: Uint8Array
  ): NodeWithNextId => {
    const nodeWithNextIdWasm: NodeWithNextIdWasm =
      NodeWithNextIdWasmType.decode_transaction_with_next_tx_id(byteArray);
    const nodeWithNextId: NodeWithNextId = {
      node: nodeWithNextIdWasm.node,
      nextTransactionId: nodeWithNextIdWasm.next_transaction_id,
    };
    return nodeWithNextId;
  };
}

export const createShieldedMasterAccount = (
  alias: string,
  seedPhrase: string,
  password?: string
) => {
  const shieldedAccount = create_master_shielded_account(
    alias,
    seedPhrase,
    password
  );
  return shieldedAccount;
};

export const createShieldedDerivedAccount = (
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

export class MaspShieldedAccount {
  // using this instead of keyword'ed constructor as we want this to be async
  // for being able to kickstart the wasm stuff with the call to init()
  static init = async (): Promise<ShieldedAccount> => {
    await init();
    return new ShieldedAccount();
  };

  createShieldedAccount = () => {
    console.log("createShieldedAccount");
  };
}
