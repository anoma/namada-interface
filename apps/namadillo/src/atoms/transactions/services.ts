import { IndexedTx, StargateClient } from "@cosmjs/stargate";
import { DefaultApi, WrapperTransaction } from "@namada/indexer-client";
import { IbcTransferTransactionData } from "types";
import { sanitizeAddress } from "utils/address";

type SearchByTagsQuery = {
  key: string;
  value: string;
};

const getTimeoutPacketParams = (
  ibcTx: IbcTransferTransactionData
): SearchByTagsQuery[] => {
  return [
    {
      key: "timeout_packet.packet_sequence",
      value: ibcTx.sequence.toString(),
    },
    {
      key: "timeout_packet.packet_src_channel",
      value: ibcTx.sourceChannel,
    },
    {
      key: "timeout_packet.packet_src_port",
      value: ibcTx.sourcePort,
    },
  ];
};

const getAckPacketsParams = (
  ibcTx: IbcTransferTransactionData
): SearchByTagsQuery[] => {
  return [
    {
      key: "acknowledge_packet.packet_sequence",
      value: ibcTx.sequence.toString(),
    },
    {
      key: "acknowledge_packet.packet_src_channel",
      value: ibcTx.sourceChannel,
    },
    {
      key: "acknowledge_packet.packet_src_port",
      value: ibcTx.sourcePort,
    },
  ];
};

export const queryForIbcTimeout = async (
  client: StargateClient,
  ibcTx: IbcTransferTransactionData
): Promise<IndexedTx[]> => {
  return await client.searchTx(getTimeoutPacketParams(ibcTx));
};

export const queryForAck = async (
  client: StargateClient,
  ibcTx: IbcTransferTransactionData
): Promise<IndexedTx[]> => {
  return await client.searchTx(getAckPacketsParams(ibcTx));
};

export const fetchTransaction = async (
  api: DefaultApi,
  hash: string
): Promise<WrapperTransaction> => {
  // indexer only accepts the hash as lowercase
  return (await api.apiV1ChainWrapperTxIdGet(sanitizeAddress(hash))).data;
};
