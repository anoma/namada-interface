import init, { perform_shielded_transaction, decode_transaction_with_next_tx_id, NodeWithNextId as NodeWithNextIdWasmType } from "./utils/masp-web";


// fetches a file from create react app public/assets/ folder to byte array
const fetchFromPublicFolderToByteArray = async (fileName: string): Promise<Uint8Array | undefined> => {
  const response = await fetch(`${process.env.PUBLIC_URL}/assets/${fileName}`);
  const data = await (await response?.blob()).arrayBuffer();
  const dataAsByteArray = new Uint8Array(data);
  return Promise.resolve(dataAsByteArray);
}

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
  
  performShieldedTransaction =  async (nodesWithNextId: NodeWithNextId[]) => {
    const nodesWithNextIdWasm: NodeWithNextIdWasm[] = nodesWithNextId.map(nodeWithNextId => {
      return {
        node: nodeWithNextId.node,
        next_transaction_id: nodeWithNextId.nextTransactionId
      }
    });

    // TODO: just testing with hard coded values, move to UI
    const spendingKey = "spending-key-1";
    const paymentAddress = "5b9e0b8a2fa1d274d57bc622d35c64e33036c0e1cae0a3d6959321d43c66a8ac0dbc6ac29aa3b09d7e9020";
    const amount: BigInt = BigInt(2000000); 
    const spendParamBytesAsByteArray = await fetchFromPublicFolderToByteArray("masp-spend.params");
    const outputParamBytesAsByteArray = await fetchFromPublicFolderToByteArray("masp-output.params");

    if (spendParamBytesAsByteArray && outputParamBytesAsByteArray) {
      const shieldedTransfer = perform_shielded_transaction(nodesWithNextIdWasm, spendingKey, paymentAddress, amount, spendParamBytesAsByteArray, outputParamBytesAsByteArray);
      console.log(shieldedTransfer, "shieldedTransfer returned");
      // return Promise.resolve(shieldedTransfer);
      return Promise.resolve([1,2,3]);
    } else {
      return Promise.resolve([]);
    }
    
  };

  createTransaction = () => {
    console.log("MaspWeb.createTransaction");
  };

  static decodeTransactionWithNextTxId = (byteArray: Uint8Array): NodeWithNextId => {
    const nodeWithNextIdWasm: NodeWithNextIdWasm = NodeWithNextIdWasmType.decode_transaction_with_next_tx_id(byteArray);
    const nodeWithNextId: NodeWithNextId = {
      node: nodeWithNextIdWasm.node,
      nextTransactionId: nodeWithNextIdWasm.next_transaction_id
    };
    return nodeWithNextId;
  };
}
