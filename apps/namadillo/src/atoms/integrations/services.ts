import { OfflineSigner } from "@cosmjs/launchpad";
import { coin, coins } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";
import BigNumber from "bignumber.js";

export type IBCTransferParams = {
  signer: OfflineSigner;
  sourceAddress: string;
  destinationAddress: string;
  amount: BigNumber;
  token: string;
  channelId: string;
  memo?: string;
};

export const submitIbcTransfer =
  (transferParams: IBCTransferParams) =>
  async (rpc: string): Promise<void> => {
    const {
      signer,
      sourceAddress,
      destinationAddress,
      amount,
      token,
      channelId,
      memo,
    } = transferParams;

    const client = await SigningStargateClient.connectWithSigner(rpc, signer, {
      broadcastPollIntervalMs: 300,
      broadcastTimeoutMs: 8_000,
    });

    const fee = {
      amount: coins("0", token),
      gas: "222000",
    };

    const response = await client.sendIbcTokens(
      sourceAddress,
      destinationAddress,
      coin(amount.toString(), token),
      "transfer",
      channelId,
      undefined, // timeout height
      Math.floor(Date.now() / 1000) + 60, // timeout timestamp
      fee,
      memo
    );

    if (response.code !== 0) {
      throw new Error(response.code + " " + response.rawLog);
    }
  };
