import init, {
  perform_shielded_transaction,
  decode_transaction_with_next_tx_id,
  NodeWithNextId as NodeWithNextIdWasmType,
} from "./utils/masp-web";

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
    nodesWithNextId: NodeWithNextId[]
  ): Promise<Uint8Array> => {
    const nodesWithNextIdWasm: NodeWithNextIdWasm[] = nodesWithNextId.map(
      (nodeWithNextId) => {
        return {
          node: nodeWithNextId.node,
          next_transaction_id: nodeWithNextId.nextTransactionId,
        };
      }
    );

    // TODO: just testing with hard coded values, move to UI
    // memas-spending-key-5
    const spendingKey =
      "xsktest1qqqqqqqqqqqqqqp5testsunq45vj6qgqr75zdu4h2jmuynj3gfd3p42ackctytcvzsmf97xgqz74gysv58xu0l0n77flhyavj4he27fvp96jwf8kkqesu9c95gcyjlwsn4axc2y7l84jfw34dmncs2ua5elg6jyk3lxzkacqfvwevsesftgkcwl483smj6j4glujk6x472qqf6u8ze65ads0fc8msunws09yn3cnxq832f2chqlhf0rhxzwvm72us3s3zmwzg06rhcqt0f54m";

    // memas-payment-address-1
    const paymentAddress =
      "patest1cdrf76r0lv8dyww0mdt7mqrau864xqu7qav54k2zc57kmtmd7jccurkznl36mrvqarhmsnp5phc";

    const amount: BigInt = BigInt(2000000);
    const spendParamBytesAsByteArray = await fetchFromPublicFolderToByteArray(
      "masp-spend.params"
    );
    const outputParamBytesAsByteArray = await fetchFromPublicFolderToByteArray(
      "masp-output.params"
    );

    if (spendParamBytesAsByteArray && outputParamBytesAsByteArray) {
      const shieldedTransfer = perform_shielded_transaction(
        nodesWithNextIdWasm,
        spendingKey,
        paymentAddress,
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
