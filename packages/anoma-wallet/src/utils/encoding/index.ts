import { MaspWeb, NodeWithNextId } from "@anoma/masp-web";

// whenever we have to encode/decode stuff, it is best to be done in rust
// as the borhs lib would be way overhead to use in ts side mostly
export const decodeTransactionWithNextTxId = async (transactionAsByteArray: Uint8Array): Promise<NodeWithNextId> => {
    await MaspWeb.init();
    const decodedData = MaspWeb.decodeTransactionWithNextTxId(transactionAsByteArray);
    return decodedData;
};